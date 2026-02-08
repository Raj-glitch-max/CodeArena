/**
 * ELO Rating System Implementation
 * Based on the standard ELO algorithm used in chess and competitive games
 */

// K-factor determines how much ratings change per game
const K_FACTOR = 32;

// Rank thresholds
export const RANK_THRESHOLDS = {
    bronze: 0,
    silver: 1200,
    gold: 1400,
    platinum: 1600,
    diamond: 1800,
    master: 2000,
    grandmaster: 2200
};

export type Rank = keyof typeof RANK_THRESHOLDS;

/**
 * Calculate expected score for a player
 * @param playerRating - Current rating of the player
 * @param opponentRating - Current rating of the opponent
 * @returns Expected score (0 to 1)
 */
function calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new rating after a match
 * @param currentRating - Player's current rating
 * @param opponentRating - Opponent's rating
 * @param actualScore - Actual result (1 = win, 0.5 = draw, 0 = loss)
 * @param kFactor - K-factor (default 32)
 * @returns New rating
 */
export function calculateNewRating(
    currentRating: number,
    opponentRating: number,
    actualScore: number,
    kFactor: number = K_FACTOR
): number {
    const expectedScore = calculateExpectedScore(currentRating, opponentRating);
    const ratingChange = kFactor * (actualScore - expectedScore);
    return Math.round(currentRating + ratingChange);
}

/**
 * Calculate rating changes for both players
 * @param winnerRating - Winner's current rating
 * @param loserRating - Loser's current rating
 * @returns Object with new ratings and rating changes
 */
export function calculateRatingChanges(
    winnerRating: number,
    loserRating: number
): {
    winnerNewRating: number;
    loserNewRating: number;
    winnerChange: number;
    loserChange: number;
} {
    const winnerNewRating = calculateNewRating(winnerRating, loserRating, 1);
    const loserNewRating = calculateNewRating(loserRating, winnerRating, 0);

    return {
        winnerNewRating,
        loserNewRating,
        winnerChange: winnerNewRating - winnerRating,
        loserChange: loserNewRating - loserRating
    };
}

/**
 * Determine rank based on rating
 * @param rating - Player's rating
 * @returns Rank name
 */
export function getRank(rating: number): Rank {
    if (rating >= RANK_THRESHOLDS.grandmaster) return 'grandmaster';
    if (rating >= RANK_THRESHOLDS.master) return 'master';
    if (rating >= RANK_THRESHOLDS.diamond) return 'diamond';
    if (rating >= RANK_THRESHOLDS.platinum) return 'platinum';
    if (rating >= RANK_THRESHOLDS.gold) return 'gold';
    if (rating >= RANK_THRESHOLDS.silver) return 'silver';
    return 'bronze';
}

/**
 * Calculate rating change with bonus for underdog wins
 * @param winnerRating - Winner's rating
 * @param loserRating - Loser's rating
 * @returns Rating changes with potential underdog bonus
 */
export function calculateRatingChangesWithBonus(
    winnerRating: number,
    loserRating: number
): {
    winnerNewRating: number;
    loserNewRating: number;
    winnerChange: number;
    loserChange: number;
    isUpset: boolean;
} {
    const ratingDiff = loserRating - winnerRating;
    const isUpset = ratingDiff > 200; // Upset if winner is 200+ points below

    // Apply bonus K-factor for upsets
    const kFactor = isUpset ? K_FACTOR * 1.5 : K_FACTOR;

    const winnerNewRating = calculateNewRating(winnerRating, loserRating, 1, kFactor);
    const loserNewRating = calculateNewRating(loserRating, winnerRating, 0, K_FACTOR);

    return {
        winnerNewRating,
        loserNewRating,
        winnerChange: winnerNewRating - winnerRating,
        loserChange: loserNewRating - loserRating,
        isUpset
    };
}
