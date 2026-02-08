import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token: string) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(WEBSOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected:', this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
            }
        });

        this.socket.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Matchmaking events
    joinQueue(mode: string, difficulty?: string) {
        this.socket?.emit('matchmaking:join-queue', { mode, difficulty });
    }

    leaveQueue() {
        this.socket?.emit('matchmaking:leave-queue');
    }

    // Battle events
    joinBattle(battleId: string) {
        this.socket?.emit('battle:join', battleId);
    }

    leaveBattle(battleId: string) {
        this.socket?.emit('battle:leave', battleId);
    }

    markReady(battleId: string) {
        this.socket?.emit('battle:ready', battleId);
    }

    sendCodeRunning(battleId: string) {
        this.socket?.emit('battle:code-running', { battleId });
    }

    sendCodeSubmit(battleId: string, testsPassed: number, testsTotal: number, completionTime: number) {
        this.socket?.emit('battle:code-submit', {
            battleId,
            testsPassed,
            testsTotal,
            completionTime
        });
    }

    sendChatMessage(battleId: string, message: string) {
        this.socket?.emit('battle:chat', { battleId, message });
    }

    // Event listeners
    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
        return () => this.socket?.off(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    // Get connection status
    get connected() {
        return this.socket?.connected || false;
    }

    get socketId() {
        return this.socket?.id;
    }
}

export const socketService = new SocketService();
