import axios from 'axios';

const ratingApi = axios.create({
    baseURL: 'http://localhost:3004/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export interface LeaderboardEntry {
    id: string;
    username: string;
    rating: number;
    rank: string;
    wins: number;
    losses: number;
    totalBattles: number;
    avatarUrl?: string;
    position: number;
    winRate: string;
}

export interface UserRank {
    id: string;
    username: string;
    rating: number;
    rank: string;
    wins: number;
    losses: number;
    totalBattles: number;
    position: number;
    winRate: string;
}

export interface RecentBattle {
    id: string;
    won: boolean;
    opponent?: string;
    completedAt: Date | null;
}

export interface UserStats {
    id: string;
    username: string;
    rating: number;
    rank: string;
    wins: number;
    losses: number;
    totalBattles: number;
    winRate: string;
    recentBattles: RecentBattle[];
}

export interface RatingUpdate {
    winner: {
        id: string;
        oldRating: number;
        newRating: number;
        ratingChange: number;
        oldRank: string;
        newRank: string;
        rankUp: boolean;
    };
    loser: {
        id: string;
        oldRating: number;
        newRating: number;
        ratingChange: number;
        oldRank: string;
        newRank: string;
        rankDown: boolean;
    };
    isUpset: boolean;
}

// Get global leaderboard
export const getLeaderboard = async (
    limit: number = 100,
    offset: number = 0
): Promise<LeaderboardEntry[]> => {
    const response = await ratingApi.get('/leaderboard', {
        params: { limit, offset }
    });
    return response.data;
};

// Get user rank position
export const getUserRank = async (userId: string): Promise<UserRank> => {
    const response = await ratingApi.get(`/users/${userId}/rank`);
    return response.data;
};

// Get user stats with battle history
export const getUserStats = async (userId: string): Promise<UserStats> => {
    const response = await ratingApi.get(`/users/${userId}/stats`);
    return response.data;
};

// Update ratings after battle (admin/system call)
export const updateRatings = async (
    battleId: string,
    winnerId: string,
    loserId: string
): Promise<RatingUpdate> => {
    const response = await ratingApi.post('/update', {
        battleId,
        winnerId,
        loserId
    });
    return response.data;
};

export default ratingApi;
