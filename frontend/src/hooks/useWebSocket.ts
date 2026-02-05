 import { useEffect, useRef, useState, useCallback } from 'react'
 import { API_CONFIG, BATTLE_CONFIG } from '@/config/constants'
 import type { WSMessage } from '@/types'
 
 interface UseWebSocketOptions {
   onMessage?: (message: WSMessage) => void
   onOpen?: () => void
   onClose?: () => void
   onError?: (error: Event) => void
   reconnect?: boolean
 }
 
 interface UseWebSocketReturn {
   isConnected: boolean
   isConnecting: boolean
   error: string | null
   send: (data: unknown) => void
   connect: () => void
   disconnect: () => void
 }
 
 export function useWebSocket(
   endpoint: string,
   options: UseWebSocketOptions = {}
 ): UseWebSocketReturn {
   const { onMessage, onOpen, onClose, onError, reconnect = true } = options
   
   const wsRef = useRef<WebSocket | null>(null)
   const reconnectAttempts = useRef(0)
   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
   
   const [isConnected, setIsConnected] = useState(false)
   const [isConnecting, setIsConnecting] = useState(false)
   const [error, setError] = useState<string | null>(null)
   
   const getWsUrl = useCallback(() => {
     const token = localStorage.getItem('access_token')
     const base = API_CONFIG.WS_URL.replace('http', 'ws')
     return `${base}${endpoint}${token ? `?token=${encodeURIComponent(token)}` : ''}`
   }, [endpoint])
   
   const connect = useCallback(() => {
     if (wsRef.current?.readyState === WebSocket.OPEN) return
     
     setIsConnecting(true)
     setError(null)
     
     try {
       wsRef.current = new WebSocket(getWsUrl())
       
       wsRef.current.onopen = () => {
         setIsConnected(true)
         setIsConnecting(false)
         reconnectAttempts.current = 0
         onOpen?.()
       }
       
       wsRef.current.onclose = () => {
         setIsConnected(false)
         setIsConnecting(false)
         onClose?.()
         
         // Attempt reconnection
         if (reconnect && reconnectAttempts.current < BATTLE_CONFIG.WS_RECONNECT_ATTEMPTS) {
           reconnectAttempts.current++
           reconnectTimeoutRef.current = setTimeout(() => {
             connect()
           }, BATTLE_CONFIG.WS_RECONNECT_DELAY * reconnectAttempts.current)
         }
       }
       
       wsRef.current.onerror = (event) => {
         setError('WebSocket connection error')
         onError?.(event)
       }
       
       wsRef.current.onmessage = (event) => {
         try {
           const message = JSON.parse(event.data) as WSMessage
           onMessage?.(message)
         } catch (e) {
           console.warn('Failed to parse WebSocket message:', e)
         }
       }
     } catch (e) {
       setIsConnecting(false)
       setError(e instanceof Error ? e.message : 'Failed to connect')
     }
   }, [getWsUrl, onMessage, onOpen, onClose, onError, reconnect])
   
   const disconnect = useCallback(() => {
     if (reconnectTimeoutRef.current) {
       clearTimeout(reconnectTimeoutRef.current)
     }
     reconnectAttempts.current = BATTLE_CONFIG.WS_RECONNECT_ATTEMPTS // Prevent reconnection
     wsRef.current?.close()
   }, [])
   
   const send = useCallback((data: unknown) => {
     if (wsRef.current?.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify(data))
     } else {
       console.warn('WebSocket is not connected')
     }
   }, [])
   
   // Cleanup on unmount
   useEffect(() => {
     return () => {
       disconnect()
     }
   }, [disconnect])
   
   return {
     isConnected,
     isConnecting,
     error,
     send,
     connect,
     disconnect,
   }
 }