import { router } from '../trpc';
import { enhancedTournamentRouter } from './tournament-enhanced';
import { teamRouter } from './team';
import { enhancedTeamRouter } from './team-enhanced';
import { matchRouter } from './match';
import { enhancedMatchRouter } from './match-enhanced';
import { playerRouter } from './player';
import { adminRouter } from './admin';
import { leaderboardRouter } from './leaderboard';
import { mediaRouter } from './media';
import { gamificationRouter } from './gamification';
import { rsvpRouter } from './rsvp';
export const appRouter = router({
    // Enhanced routers with new features
    tournament: enhancedTournamentRouter,
    team: enhancedTeamRouter, // Enhanced team management with profiles
    match: enhancedMatchRouter, // Enhanced scoring and disputes
    player: playerRouter, // New player profiles and stats
    admin: adminRouter, // New admin controls
    media: mediaRouter, // New media upload and gallery features
    gamification: gamificationRouter, // New gamification system
    rsvp: rsvpRouter, // RSVP management system
    // Legacy routers (kept for compatibility)
    legacyTeam: teamRouter,
    legacyMatch: matchRouter,
    // Other routers
    leaderboard: leaderboardRouter,
});
