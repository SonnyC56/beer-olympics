import { router } from '../trpc';
import { tournamentRouter } from './tournament';
import { teamRouter } from './team';
import { matchRouter } from './match';
import { leaderboardRouter } from './leaderboard';

export const appRouter = router({
  tournament: tournamentRouter,
  team: teamRouter,
  match: matchRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;