import { API_BASE_URL } from '../config/env'

export function connectBattleWS(battleId: number, token: string, onMessage: (data: any) => void) {
  const base = (import.meta.env.VITE_API_WS_URL as string) || API_BASE_URL
  const wsBase = base.replace('http://', 'ws://').replace('https://', 'wss://')
  const wsUrl = `${wsBase}/ws/battles/${battleId}?token=${encodeURIComponent(token)}`
  const ws = new WebSocket(wsUrl)
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)) } catch { }
  }
  return ws
}
