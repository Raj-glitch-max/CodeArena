import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    callback: () => void;
    preventDefault?: boolean;
    description?: string;
}

/**
 * Custom hook for handling keyboard shortcuts
 * Supports Ctrl/Cmd, Shift, and Alt modifiers
 * 
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'Enter',
 *     ctrlKey: true,
 *     callback: () => runCode(),
 *     preventDefault: true,
 *     description: 'Run code'
 *   }
 * ]);
 */
export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled: boolean = true) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        shortcuts.forEach((shortcut) => {
            const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const matchesCtrl = shortcut.ctrlKey
                ? (event.ctrlKey || event.metaKey) // Support both Ctrl (Windows/Linux) and Cmd (Mac)
                : !(event.ctrlKey || event.metaKey);
            const matchesShift = shortcut.shiftKey
                ? event.shiftKey
                : !event.shiftKey;
            const matchesAlt = shortcut.altKey
                ? event.altKey
                : !event.altKey;

            if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
                if (shortcut.preventDefault) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                shortcut.callback();
            }
        });
    }, [shortcuts, enabled]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);

    /**
     * Get formatted shortcut string for display
     * e.g., "Ctrl+Shift+Enter" or "Cmd+S"
     */
    const getShortcutDisplay = useCallback((shortcut: ShortcutConfig): string => {
        const parts: string[] = [];
        const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

        if (shortcut.ctrlKey) {
            parts.push(isMac ? 'Cmd' : 'Ctrl');
        }
        if (shortcut.shiftKey) {
            parts.push('Shift');
        }
        if (shortcut.altKey) {
            parts.push('Alt');
        }
        if (shortcut.key) {
            parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1));
        }

        return parts.join('+');
    }, []);

    return { getShortcutDisplay };
};
