import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6380';

export const redis = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Cache keys
export const CACHE_KEYS = {
    LEADERBOARD_GLOBAL: 'leaderboard:global',
    LEADERBOARD_DAILY: 'leaderboard:daily',
    LEADERBOARD_WEEKLY: 'leaderboard:weekly',
    LEADERBOARD_MONTHLY: 'leaderboard:monthly',
    USER_RANK: (userId: string) => `user:${userId}:rank`,
    USER_STATS: (userId: string) => `user:${userId}:stats`
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
    LEADERBOARD: 60, // 1 minute
    USER_RANK: 300, // 5 minutes
    USER_STATS: 180 // 3 minutes
};

redis.on('connect', () => {
    console.log('✅ Redis connected (rating service)');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});
