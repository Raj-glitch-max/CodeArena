from __future__ import annotations

import asyncio
import json
import os

import httpx
import websockets

API = os.getenv("API", "http://localhost:8000")
AUTH = {"Authorization": "Bearer dev"}


async def test_health(client: httpx.AsyncClient) -> None:
    r = await client.get(f"{API}/health")
    print("/health:", r.status_code, r.json())


async def test_matchmaking(client: httpx.AsyncClient) -> None:
    payload = {
        "mode": "ranked_1v1",
        "difficulty": "medium",
        "language": "python",
        "algorithm_id": 1,
    }
    r = await client.post(f"{API}/api/v1/matchmaking/queue/join", json=payload, headers=AUTH)
    print("join queue:", r.status_code, r.json())
    r2 = await client.post(f"{API}/api/v1/matchmaking/queue/leave", headers=AUTH)
    print("leave queue:", r2.status_code, r2.json())


async def test_submissions(client: httpx.AsyncClient) -> None:
    payload = {
        "challenge_id": 1,
        "code": "print('hello')",
        "language": "python",
        "algorithm_id": 1,
    }
    r = await client.post(f"{API}/api/v1/submissions/run", json=payload, headers=AUTH)
    print("run submission:", r.status_code, r.json())
    r2 = await client.post(f"{API}/api/v1/submissions/submit", json=payload, headers=AUTH)
    print("submit submission:", r2.status_code, r2.json())


async def test_ws() -> None:
    uri = API.replace("http", "ws") + "/ws/battles/1?token=dev"
    async with websockets.connect(uri) as ws:
        await ws.send(json.dumps({"type": "PING"}))
        msg = await ws.recv()
        print("ws recv:", msg)


async def main() -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        await test_health(client)
        await test_matchmaking(client)
        await test_submissions(client)
    try:
        await test_ws()
    except Exception as e:
        print("ws error:", repr(e))


if __name__ == "__main__":
    asyncio.run(main())
