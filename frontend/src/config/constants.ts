 // Application constants
 export const APP_NAME = 'CodeArena'
 export const APP_TAGLINE = 'The Neural Combat Network'
 
 // API Configuration
 export const API_CONFIG = {
   BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
   WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
   TIMEOUT: 30000,
   RETRY_ATTEMPTS: 3,
   RETRY_DELAY: 1000,
 } as const
 
 // Battle Configuration
 export const BATTLE_CONFIG = {
   MAX_DURATION_SECONDS: 1800, // 30 minutes
   CODE_EXECUTION_TIMEOUT: 10000, // 10 seconds
   WS_RECONNECT_ATTEMPTS: 5,
   WS_RECONNECT_DELAY: 2000,
 } as const
 
 // Matchmaking Configuration
 export const MATCHMAKING_CONFIG = {
   QUEUE_POLL_INTERVAL: 3000, // 3 seconds
   ELO_RANGE_INITIAL: 100,
   ELO_RANGE_INCREMENT: 50,
   ELO_RANGE_MAX: 500,
 } as const
 
 // Supported Languages
 export const LANGUAGES = [
   { id: 'python', name: 'Python', extension: '.py' },
   { id: 'javascript', name: 'JavaScript', extension: '.js' },
   { id: 'typescript', name: 'TypeScript', extension: '.ts' },
   { id: 'java', name: 'Java', extension: '.java' },
   { id: 'cpp', name: 'C++', extension: '.cpp' },
   { id: 'go', name: 'Go', extension: '.go' },
   { id: 'rust', name: 'Rust', extension: '.rs' },
 ] as const
 
 // Difficulty levels
 export const DIFFICULTIES = [
   { id: 'easy', name: 'Easy', color: 'text-neon-green' },
   { id: 'medium', name: 'Medium', color: 'text-neon-yellow' },
   { id: 'hard', name: 'Hard', color: 'text-destructive' },
 ] as const
 
 // ELO Ranks
 export const ELO_RANKS = [
   { name: 'Bronze', minElo: 0, maxElo: 1199, color: 'text-orange-400' },
   { name: 'Silver', minElo: 1200, maxElo: 1399, color: 'text-gray-400' },
   { name: 'Gold', minElo: 1400, maxElo: 1599, color: 'text-yellow-400' },
   { name: 'Platinum', minElo: 1600, maxElo: 1799, color: 'text-cyan-400' },
   { name: 'Diamond', minElo: 1800, maxElo: 1999, color: 'text-blue-400' },
   { name: 'Master', minElo: 2000, maxElo: 2199, color: 'text-purple-400' },
   { name: 'Grandmaster', minElo: 2200, maxElo: Infinity, color: 'text-red-400' },
 ] as const
 
 // Get rank from ELO
 export function getRankFromElo(elo: number) {
   return ELO_RANKS.find(rank => elo >= rank.minElo && elo <= rank.maxElo) ?? ELO_RANKS[0]
 }