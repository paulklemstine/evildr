// Supabase client stub — will connect to real Supabase in Phase 2

export interface UserProfile {
  id: string
  displayName: string
  tier: 'free' | 'player' | 'pro'
  turnsToday: number
  ageVerified: boolean
}

/**
 * Placeholder Supabase client for MVP.
 *
 * Returns mock data for local development. Will be replaced with
 * a real Supabase connection in Phase 2 (auth, PostgreSQL, storage).
 */
export class SupabaseClient {
  private mockTurnCount: number = 0

  /**
   * Get the currently authenticated user's profile.
   * Returns null if not authenticated (in Phase 2).
   * For MVP, always returns a local mock user.
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    return {
      id: 'local',
      displayName: 'Player',
      tier: 'free',
      turnsToday: this.mockTurnCount,
      ageVerified: false,
    }
  }

  /**
   * Increment the turn count for the current user.
   * Returns the new turn count.
   * For MVP, just increments an in-memory counter.
   */
  async incrementTurnCount(): Promise<number> {
    this.mockTurnCount += 1
    return this.mockTurnCount
  }
}
