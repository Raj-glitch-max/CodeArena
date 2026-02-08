import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6380';

// Publisher client
export const publisher = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Subscriber client
export const subscriber = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Regular Redis client for get/set operations
export const redisClient = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

publisher.on('connect', () => {
    console.log('✅ Redis Publisher connected');
});

subscriber.on('connect', () => {
    console.log('✅ Redis Subscriber connected');
});

redisClient.on('connect', () => {
    console.log('✅ Redis Client connected');
});

publisher.on('error', (err) => {
    console.error('❌ Redis Publisher error:', err);
});

subscriber.on('error', (err) => {
    console.error('❌ Redis Subscriber error:', err);
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Client error:', err);
});
