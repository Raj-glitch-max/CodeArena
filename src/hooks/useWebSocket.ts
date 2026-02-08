import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

export interface WebSocketCallbacks {
    // Matchmaking events
    onQueueJoined?: (data: { position: number; mode: string; difficulty?: string }) => void;
    onQueueLeft?: () => void;
    onMatchFound?: (data: { battleId: string; opponent: { username: string; rating: number }; mode: string }) => void;

    // Battle events
    onBattleJoined?: (data: { battleId: string; battleInfo: any }) => void;
    onPlayerJoined?: (data: { username: string; userId: string }) => void;
    onPlayerLeft?: (data: { username: string; userId: string }) => void;
    onPlayerReady?: (data: { username: string; userId: string; readyCount: number }) => void;
    onBattleStart?: (data: { battleId: string; startTime: number }) => void;
    onBattleCompleted?: (data: { winner: string; results: any }) => void;

    // Code events
    onOpponentRunning?: (data: { username: string }) => void;
    onOpponentSubmitted?: (data: { username: string; testsPassed: number; testsTotal: number }) => void;

    // Chat events
    onChatMessage?: (data: { username: string; message: string; timestamp: number }) => void;

    // Error events
    onError?: (data: { error: string }) => void;
}

export function useWebSocket(callbacks: WebSocketCallbacks) {
    const { token } = useAuth();
    const callbacksRef = useRef(callbacks);
    const cleanupFunctionsRef = useRef<(() => void)[]>([]);

    // Update callbacks ref when they change
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    useEffect(() => {
        if (!token) return;

        // Connect to WebSocket server
        socketService.connect(token);

        // Setup event listeners
        const addListener = (event: string, callback?: (...args: any[]) => void) => {
            if (callback) {
                const cleanup = socketService.on(event, (...args) => {
                    callback(...args);
                });
                cleanupFunctionsRef.current.push(cleanup);
            }
        };

        // Matchmaking events
        addListener('matchmaking:queue-joined', callbacksRef.current.onQueueJoined);
        addListener('matchmaking:queue-left', callbacksRef.current.onQueueLeft);
        addListener('matchmaking:match-found', callbacksRef.current.onMatchFound);
        addListener('matchmaking:error', callbacksRef.current.onError);

        // Battle events
        addListener('battle:joined', callbacksRef.current.onBattleJoined);
        addListener('battle:player-joined', callbacksRef.current.onPlayerJoined);
        addListener('battle:player-left', callbacksRef.current.onPlayerLeft);
        addListener('battle:player-ready', callbacksRef.current.onPlayerReady);
        addListener('battle:start', callbacksRef.current.onBattleStart);
        addListener('battle:completed', callbacksRef.current.onBattleCompleted);
        addListener('battle:error', callbacksRef.current.onError);

        // Code events
        addListener('battle:opponent-running', callbacksRef.current.onOpponentRunning);
        addListener('battle:opponent-submitted', callbacksRef.current.onOpponentSubmitted);

        // Chat events
        addListener('battle:chat-message', callbacksRef.current.onChatMessage);

        // Cleanup on unmount
        return () => {
            cleanupFunctionsRef.current.forEach(cleanup => cleanup());
            cleanupFunctionsRef.current = [];
        };
    }, [token]);

    // Methods to trigger events
    const joinQueue = useCallback((mode: string, difficulty?: string) => {
        socketService.joinQueue(mode, difficulty);
    }, []);

    const leaveQueue = useCallback(() => {
        socketService.leaveQueue();
    }, []);

    const joinBattle = useCallback((battleId: string) => {
        socketService.joinBattle(battleId);
    }, []);

    const leaveBattle = useCallback((battleId: string) => {
        socketService.leaveBattle(battleId);
    }, []);

    const markReady = useCallback((battleId: string) => {
        socketService.markReady(battleId);
    }, []);

    const sendCodeRunning = useCallback((battleId: string) => {
        socketService.sendCodeRunning(battleId);
    }, []);

    const sendCodeSubmit = useCallback((battleId: string, testsPassed: number, testsTotal: number, completionTime: number) => {
        socketService.sendCodeSubmit(battleId, testsPassed, testsTotal, completionTime);
    }, []);

    const sendChatMessage = useCallback((battleId: string, message: string) => {
        socketService.sendChatMessage(battleId, message);
    }, []);

    return {
        // Connection status
        connected: socketService.connected,
        socketId: socketService.socketId,

        // Matchmaking methods
        joinQueue,
        leaveQueue,

        // Battle methods
        joinBattle,
        leaveBattle,
        markReady,

        // Code methods
        sendCodeRunning,
        sendCodeSubmit,

        // Chat methods
        sendChatMessage
    };
}
