import { useCallback, useRef, useEffect } from 'react';

export type SoundName = 'countdown' | 'battle-start' | 'victory' | 'defeat' | 'opponent-action' | 'notification';

interface SoundOptions {
    volume?: number;
    loop?: boolean;
}

/**
 * Custom hook for playing sound effects using Web Audio API
 * Generates tones synthetically to avoid needing external audio files
 */
export const useSound = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const volumeRef = useRef(0.3); // Default volume (0-1)
    const activeOscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());

    // Initialize Audio Context
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (error) {
                console.warn('Web Audio API not supported', error);
            }
        }

        return () => {
            // Cleanup
            activeOscillatorsRef.current.forEach((osc) => {
                try {
                    osc.stop();
                } catch (e) {
                    // Oscillator already stopped
                }
            });
            activeOscillatorsRef.current.clear();
        };
    }, []);

    /**
     * Play a beep tone with specified frequency and duration
     */
    const playBeep = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        // Volume envelope for smooth sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volumeRef.current, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);

        return oscillator;
    }, []);

    /**
     * Play countdown tick sound (short beep)
     */
    const playCountdownTick = useCallback(() => {
        playBeep(800, 0.1, 'square');
    }, [playBeep]);

    /**
     * Play battle start sound (ascending tones)
     */
    const playBattleStart = useCallback(() => {
        const frequencies = [400, 500, 600, 800];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                playBeep(freq, 0.15, 'sine');
            }, i * 80);
        });
    }, [playBeep]);

    /**
     * Play victory sound (triumphant ascending tones)
     */
    const playVictory = useCallback(() => {
        const melody = [
            { freq: 523, duration: 0.2, delay: 0 },      // C5
            { freq: 659, duration: 0.2, delay: 0.2 },    // E5
            { freq: 784, duration: 0.3, delay: 0.4 },    // G5
            { freq: 1047, duration: 0.5, delay: 0.7 },   // C6
        ];

        melody.forEach(({ freq, duration, delay }) => {
            setTimeout(() => {
                playBeep(freq, duration, 'sine');
            }, delay * 1000);
        });
    }, [playBeep]);

    /**
     * Play defeat sound (descending tones)
     */
    const playDefeat = useCallback(() => {
        const melody = [
            { freq: 400, duration: 0.3, delay: 0 },
            { freq: 350, duration: 0.3, delay: 0.3 },
            { freq: 300, duration: 0.5, delay: 0.6 },
        ];

        melody.forEach(({ freq, duration, delay }) => {
            setTimeout(() => {
                playBeep(freq, duration, 'triangle');
            }, delay * 1000);
        });
    }, [playBeep]);

    /**
     * Play opponent action notification (quick double beep)
     */
    const playOpponentAction = useCallback(() => {
        playBeep(600, 0.08, 'sine');
        setTimeout(() => {
            playBeep(600, 0.08, 'sine');
        }, 100);
    }, [playBeep]);

    /**
     * Play generic notification sound
     */
    const playNotification = useCallback(() => {
        playBeep(700, 0.12, 'sine');
    }, [playBeep]);

    /**
     * Main play function - routes to appropriate sound
     */
    const play = useCallback((soundName: SoundName, options?: SoundOptions) => {
        if (options?.volume !== undefined) {
            volumeRef.current = Math.max(0, Math.min(1, options.volume));
        }

        switch (soundName) {
            case 'countdown':
                playCountdownTick();
                break;
            case 'battle-start':
                playBattleStart();
                break;
            case 'victory':
                playVictory();
                break;
            case 'defeat':
                playDefeat();
                break;
            case 'opponent-action':
                playOpponentAction();
                break;
            case 'notification':
                playNotification();
                break;
            default:
                console.warn(`Unknown sound: ${soundName}`);
        }
    }, [playCountdownTick, playBattleStart, playVictory, playDefeat, playOpponentAction, playNotification]);

    /**
     * Set global volume
     */
    const setVolume = useCallback((volume: number) => {
        volumeRef.current = Math.max(0, Math.min(1, volume));
    }, []);

    /**
     * Stop all currently playing sounds
     */
    const stopAll = useCallback(() => {
        activeOscillatorsRef.current.forEach((osc) => {
            try {
                osc.stop();
            } catch (e) {
                // Already stopped
            }
        });
        activeOscillatorsRef.current.clear();
    }, []);

    return { play, setVolume, stopAll };
};
