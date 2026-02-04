from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import ws_get_current_user
from app.core.redis import get_redis
from app.services.battle_manager import BattleManager

router = APIRouter()

battle_manager = BattleManager()


@router.websocket("/ws/battles/{battle_id}")
async def battles_ws(
    websocket: WebSocket,
    battle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(ws_get_current_user),
    redis: Redis = Depends(get_redis),
):
    user_id = int(current_user.get("id", 0))
    await battle_manager.connect(battle_id, websocket, user_id)

    try:
        while True:
            try:
                payload = await websocket.receive_json()
            except Exception:
                await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
                break
            await battle_manager.handle_message(battle_id, user_id, payload)
    except WebSocketDisconnect:
        pass
    finally:
        battle_manager.disconnect(battle_id, websocket)
