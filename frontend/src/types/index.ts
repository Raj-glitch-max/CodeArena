 // ============================================
 // User & Authentication Types
 // ============================================
 
 export interface User {
   id: number
   username: string
   email: string
   rating: number
   battles_won?: number
   battles_lost?: number
   win_streak?: number
   avatar_url?: string
   created_at?: string
 }
 
 export interface AuthState {
   user: User | null
   token: string | null
   isLoading: boolean
   isAuthenticated: boolean
 }
 
 export interface LoginCredentials {
   email: string
   password: string
 }
 
 export interface SignupCredentials {
   username: string
   email: string
   password: string
 }
 
 export interface AuthResponse {
   access_token: string
   user: User
 }
 
 // ============================================
 // Problem Types
 // ============================================
 
 export type Difficulty = 'easy' | 'medium' | 'hard'
 
 export interface Problem {
   id: number
   title: string
   slug: string
   description: string
   difficulty: Difficulty
   tags: string[]
   constraints?: string[]
   examples?: ProblemExample[]
   starter_code?: Record<string, string>
   solution?: string
   acceptance_rate?: number
   submissions_count?: number
   created_at?: string
 }
 
 export interface ProblemExample {
   input: string
   output: string
   explanation?: string
 }
 
 // ============================================
 // Algorithm Types
 // ============================================
 
 export interface Algorithm {
   id: number
   name: string
   user_id: number
   battles_won: number
   battles_lost: number
   rating: number
   traits?: AlgorithmTrait[]
   is_alive: boolean
   created_at?: string
 }
 
 export interface AlgorithmTrait {
   id: string
   name: string
   description: string
   rarity: 'common' | 'rare' | 'epic' | 'legendary'
 }
 
 // ============================================
 // Battle Types
 // ============================================
 
 export type BattleStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled'
 
 export interface Battle {
   id: number
   problem_id: number
   problem?: Problem
   player1_id: number
   player2_id: number
   player1?: User
   player2?: User
   winner_id?: number
   status: BattleStatus
   player1_score?: number
   player2_score?: number
   player1_elo_change?: number
   player2_elo_change?: number
   duration_seconds?: number
   started_at?: string
   ended_at?: string
 }
 
 export interface BattleResult {
   battle: Battle
   winner: User | null
   is_draw: boolean
 }
 
 // ============================================
 // Matchmaking Types
 // ============================================
 
 export type MatchmakingMode = 'ranked_1v1' | 'casual' | 'tournament'
 
 export interface MatchmakingRequest {
   mode: MatchmakingMode
   difficulty?: Difficulty
   language?: string
   algorithm_id?: number
 }
 
 export interface QueueStatus {
   position: number
   size: number
   estimated_wait?: number
 }
 
 // ============================================
 // Submission Types
 // ============================================
 
 export type SubmissionStatus = 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error'
 
 export interface Submission {
   id: number
   problem_id: number
   user_id: number
   battle_id?: number
   code: string
   language: string
   status: SubmissionStatus
   runtime_ms?: number
   memory_kb?: number
   test_cases_passed?: number
   test_cases_total?: number
   error_message?: string
   created_at?: string
 }
 
 // ============================================
 // Leaderboard Types
 // ============================================
 
 export interface LeaderboardEntry {
   rank: number
   user: User
   rating: number
   wins: number
   losses: number
   win_rate: number
   streak: number
 }
 
 // ============================================
 // WebSocket Types
 // ============================================
 
 export type WSMessageType = 
   | 'battle_start'
   | 'battle_update'
   | 'battle_end'
   | 'opponent_progress'
   | 'test_result'
   | 'error'
 
 export interface WSMessage<T = unknown> {
   type: WSMessageType
   data: T
   timestamp: number
 }