from __future__ import annotations

from typing import Dict, Set

from fastapi import WebSocket


class BattleManager:
    def __init__(self) -> None:
        self._rooms: Dict[int, Set[WebSocket]] = {}

    async def connect(self, battle_id: int, websocket: WebSocket, user_id: int) -> None:
        await websocket.accept()
        self._rooms.setdefault(battle_id, set()).add(websocket)
        await websocket.send_json({"type": "CONNECTED", "battle_id": battle_id})

    def disconnect(self, battle_id: int, websocket: WebSocket) -> None:
        room = self._rooms.get(battle_id)
        if not room:
            return
        room.discard(websocket)
        if not room:
            self._rooms.pop(battle_id, None)

    async def broadcast(self, battle_id: int, message: dict) -> None:
        for ws in list(self._rooms.get(battle_id, set())):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(battle_id, ws)

    async def handle_message(self, battle_id: int, user_id: int, payload: dict) -> None:
        msg_type = payload.get("type")
        await self.broadcast(
            battle_id,
            {
                "type": "ACK",
                "ack_type": msg_type,
                "from": user_id,
                "ok": True,
            },
        )
