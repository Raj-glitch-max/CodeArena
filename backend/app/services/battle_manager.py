from __future__ import annotations

import asyncio
import json
from typing import Dict, Set

from fastapi import WebSocket
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.submission_service import SubmissionService


class BattleManager:
    def __init__(self) -> None:
        self._rooms: Dict[int, Set[WebSocket]] = {}
        self._state: Dict[int, dict] = {}
        self._loops: Dict[int, asyncio.Task] = {}
        self._redis_map: Dict[int, Redis] = {}

    async def _load_state(self, redis: Redis, battle_id: int) -> dict:
        raw = await redis.get(f"battles:{battle_id}:state")
        if raw:
            try:
                return json.loads(raw)
            except Exception:
                pass
        return {"timer_remaining": 600, "players": {}, "ended": False}

    async def _save_state(self, redis: Redis, battle_id: int, state: dict) -> None:
        await redis.set(f"battles:{battle_id}:state", json.dumps(state))

    async def connect(self, battle_id: int, websocket: WebSocket, user_id: int, redis: Redis) -> None:
        await websocket.accept()
        self._rooms.setdefault(battle_id, set()).add(websocket)
        await websocket.send_json({"type": "CONNECTED", "battle_id": battle_id})
        self._redis_map[battle_id] = redis
        if battle_id not in self._state:
            self._state[battle_id] = await self._load_state(redis, battle_id)
        if battle_id not in self._loops:
            self._loops[battle_id] = asyncio.create_task(self._tick_loop(battle_id))

    def disconnect(self, battle_id: int, websocket: WebSocket) -> None:
        room = self._rooms.get(battle_id)
        if not room:
            return
        room.discard(websocket)
        if not room:
            self._rooms.pop(battle_id, None)
            if battle_id in self._loops:
                self._loops[battle_id].cancel()
                self._loops.pop(battle_id, None)
            self._state.pop(battle_id, None)
            self._redis_map.pop(battle_id, None)

    async def broadcast(self, battle_id: int, message: dict) -> None:
        for ws in list(self._rooms.get(battle_id, set())):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(battle_id, ws)

    async def handle_message(self, battle_id: int, user_id: int, payload: dict, db: AsyncSession, redis: Redis) -> None:
        msg_type = payload.get("type")
        state = self._state.setdefault(battle_id, {"timer_remaining": 600, "players": {}, "ended": False})
        players = state["players"]
        p = players.setdefault(user_id, {"tests_passed": 0, "submitted": False, "code_version": 0})
        if msg_type == "CODE_UPDATE":
            p["code_version"] = p.get("code_version", 0) + 1
            if "code" in payload:
                p["code"] = payload.get("code")
            if "language" in payload:
                p["language"] = payload.get("language")
            if "challenge_id" in payload:
                p["challenge_id"] = int(payload.get("challenge_id"))
        elif msg_type == "RUN_TESTS":
            # enqueue a run using last known code for this user
            code = payload.get("code") or p.get("code") or ""
            lang = payload.get("language") or p.get("language") or "python"
            challenge_id = int(payload.get("challenge_id") or p.get("challenge_id") or 0)
            if code and challenge_id:
                svc = SubmissionService(db, redis)
                s = await svc.create_submission(user_id=user_id, challenge_id=challenge_id, code=code, language=lang, algorithm_id=None)
                await svc.enqueue(submission_id=s.id, mode="RUN")
                p["last_submission_id"] = s.id
            p["tests_passed"] = max(0, int(p.get("tests_passed", 0)))
        elif msg_type == "SUBMIT":
            code = payload.get("code") or p.get("code") or ""
            lang = payload.get("language") or p.get("language") or "python"
            challenge_id = int(payload.get("challenge_id") or p.get("challenge_id") or 0)
            if code and challenge_id:
                svc = SubmissionService(db, redis)
                s = await svc.create_submission(user_id=user_id, challenge_id=challenge_id, code=code, language=lang, algorithm_id=None)
                await svc.enqueue(submission_id=s.id, mode="SUBMIT")
                p["last_submission_id"] = s.id
            p["submitted"] = True
        await self._save_state(redis, battle_id, state)
        await self.broadcast(
            battle_id,
            {"type": "ACK", "ack_type": msg_type, "from": user_id, "ok": True},
        )

    async def _tick_loop(self, battle_id: int) -> None:
        try:
            while True:
                await asyncio.sleep(1)
                state = self._state.get(battle_id)
                if not state:
                    break
                if state.get("ended"):
                    break
                tr = state.get("timer_remaining", 0)
                if tr > 0:
                    tr -= 1
                    state["timer_remaining"] = tr
                else:
                    state["ended"] = True
                # persist state to redis each tick
                redis = self._redis_map.get(battle_id)
                if redis:
                    await self._save_state(redis, battle_id, state)
                await self.broadcast(
                    battle_id,
                    {
                        "type": "STATE_DELTA",
                        "timer_remaining_seconds": state.get("timer_remaining", 0),
                        "players": state.get("players", {}),
                        "ended": state.get("ended", False),
                    },
                )
                if state.get("ended"):
                    break
        except asyncio.CancelledError:
            return
