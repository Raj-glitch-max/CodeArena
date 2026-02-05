/**
 * Custom hook for handling async operations with loading and error states.
 * Prevents multiple concurrent executions and provides clean UX feedback.
 */
import { useState, useCallback } from 'react';

export function useAsync<T, Args extends any[]>(
    asyncFunction: (...args: Args) => Promise<T>
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(
        async (...args: Args): Promise<T | undefined> => {
            setLoading(true);
            setError(null);
            try {
                const result = await asyncFunction(...args);
                return result;
            } catch (e) {
                const err = e as Error;
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [asyncFunction]
    );

    return { execute, loading, error };
}
