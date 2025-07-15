/**
 * Enhanced Tournament Router with tournament-js integration
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { TournamentEngine, type TournamentFormat } from '../../services/tournament-engine';
import type { 
  Tournament, 
  Match, 
  BracketData,
  Standings,
  TournamentStats 
} from '../../types/tournament';
import type { Team } from '../../types';

// Input validation schemas
const tournamentFormatSchema = z.enum([
  'single_elimination',
  'double_elimination', 
  'round_robin',
  'group_stage',
  'free_for_all',
  'masters'
]);

const megaTournamentScoringSchema = z.object({
  method: z.enum(['placement', 'points', 'hybrid']),
  placementPoints: z.record(z.number()).optional(),
  participationPoints: z.number().optional(),
  bonusPointsEnabled: z.boolean().optional()
}).optional();

const bonusChallengeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  points: z.number(),
  type: z.enum(['team', 'individual']),
  maxCompletions: z.number().optional(),
  availableIn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional()
});

const tournamentSettingsSchema = z.object({
  allowTies: z.boolean().optional(),
  pointsPerWin: z.number().optional(),
  pointsPerTie: z.number().optional(),
  pointsPerLoss: z.number().optional(),
  tiebreakMethod: z.enum(['head2head', 'total', 'random']).optional(),
  autoAdvance: z.boolean().optional(),
  bronzeMatch: z.boolean().optional(),
  thirdPlaceMatch: z.boolean().optional(),
  seedingMethod: z.enum(['random', 'manual', 'ranking']).optional(),
  maxMatchesPerRound: z.number().optional(),
  matchDuration: z.number().optional(),
  breakBetweenMatches: z.number().optional(),
  venue: z.string().optional(),
  rules: z.array(z.string()).optional(),
  megaTournamentScoring: megaTournamentScoringSchema,
  bonusChallenges: z.array(bonusChallengeSchema).optional()
}).optional();

export const enhancedTournamentRouter = router({
  // Get tournament statistics by ID (for spectator mode)
  getStats: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.tournamentId}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        // Get matches and calculate stats
        const matchesResult = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' AND tournamentId = $1`,
          { parameters: [input.tournamentId] }
        );
        
        const matches = matchesResult.rows as any[];
        const completedMatches = matches.filter(m => m.isComplete);
        const activeMatches = matches.filter(m => !m.isComplete && m.startTime);
        
        // Get teams count
        const teamsResult = await query(
          `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1`,
          { parameters: [input.tournamentId] }
        );
        
        // Get unique games played
        const gamesResult = await query(
          `SELECT COUNT(DISTINCT eventId) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'match' AND tournamentId = $1 AND isComplete = true`,
          { parameters: [input.tournamentId] }
        );
        
        // Calculate average match duration
        let avgMatchDuration = 15; // default
        let matchDurationTrend = 0;
        
        if (completedMatches.length > 0) {
          const durations = completedMatches
            .filter(m => m.startTime && m.endTime)
            .map(m => {
              const start = new Date(m.startTime).getTime();
              const end = new Date(m.endTime).getTime();
              return (end - start) / (1000 * 60); // minutes
            });
            
          if (durations.length > 0) {
            avgMatchDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
            
            // Calculate trend (last 5 matches vs previous)
            if (durations.length > 5) {
              const recent = durations.slice(-5);
              const previous = durations.slice(-10, -5);
              const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
              const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
              matchDurationTrend = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
            }
          }
        }
        
        return {
          totalMatches: matches.length,
          completedMatches: completedMatches.length,
          activeMatches: activeMatches.length,
          activeTeams: teamsResult.rows[0]?.count || 0,
          uniqueGamesPlayed: gamesResult.rows[0]?.count || 0,
          avgMatchDuration,
          matchDurationTrend,
          completionPercentage: matches.length > 0 
            ? Math.round((completedMatches.length / matches.length) * 100)
            : 0
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament statistics',
        });
      }
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      format: tournamentFormatSchema.optional(),
      maxTeams: z.number().min(2).max(128),
      settings: tournamentSettingsSchema,
      isMegaTournament: z.boolean().optional(),
      parentTournamentId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const slug = input.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + '-' + nanoid(6);
        
        const tournament: Tournament = {
          _type: 'tournament',
          slug,
          name: input.name,
          date: input.date,
          ownerId: ctx.user.id,
          isOpen: true,
          format: input.format || 'single_elimination',
          maxTeams: input.maxTeams,
          settings: input.settings,
          isMegaTournament: input.isMegaTournament,
          parentTournamentId: input.parentTournamentId,
          subTournamentIds: input.isMegaTournament ? [] : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await upsertDocument(`tournament::${slug}`, tournament);
        
        // If this is a sub-tournament, update the parent's subTournamentIds
        if (input.parentTournamentId) {
          const parent = await getDocument(`tournament::${input.parentTournamentId}`) as Tournament;
          if (parent && parent.isMegaTournament) {
            parent.subTournamentIds = [...(parent.subTournamentIds || []), slug];
            parent.updatedAt = new Date().toISOString();
            await upsertDocument(`tournament::${input.parentTournamentId}`, parent);
          }
        }
        
        return { slug };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create tournament',
        });
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        return tournament;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament',
        });
      }
    }),

  startTournament: protectedProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        if (tournament.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to start this tournament',
          });
        }

        // Get registered teams
        const teamsResult = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1
           ORDER BY createdAt`,
          { parameters: [input.slug] }
        );

        const teams = teamsResult.rows as Team[];
        
        if (teams.length < 2) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'At least 2 teams required to start tournament',
          });
        }

        // Create tournament engine
        const engine = new TournamentEngine({
          format: tournament.format,
          numPlayers: teams.length,
          playerNames: teams.map(team => team.name),
          groupSize: tournament.settings?.maxMatchesPerRound || 4,
          bronzeMatch: tournament.settings?.bronzeMatch || false,
          advancers: 2
        });

        // Generate initial matches
        const matches = engine.getMatches();
        
        // Save matches to database
        for (const match of matches) {
          const teamAIndex = match.p[0] ? match.p[0] - 1 : 0;
          const teamBIndex = match.p[1] ? match.p[1] - 1 : 1;
          
          const matchDoc: Match = {
            _type: 'match',
            id: nanoid(),
            tournamentId: input.slug,
            tournamentMatchId: match.id,
            round: match.id.r,
            section: match.id.s,
            teamA: teams[teamAIndex]?.id || '',
            teamB: teams[teamBIndex]?.id || '',
            teamAName: teams[teamAIndex]?.name || '',
            teamBName: teams[teamBIndex]?.name || '',
            isComplete: false,
            mediaIds: [],
            createdAt: new Date().toISOString(),
          };
          
          await upsertDocument(`match::${matchDoc.id}`, matchDoc);
        }

        // Update tournament with engine state
        tournament.config = engine.exportState().config;
        tournament.currentRound = 1;
        tournament.totalRounds = engine.getTotalRounds?.() || 1;
        tournament.isComplete = false;
        tournament.isOpen = false; // Close registration
        tournament.updatedAt = new Date().toISOString();
        
        await upsertDocument(`tournament::${input.slug}`, tournament);
        
        return { 
          success: true, 
          matches: matches.length,
          rounds: tournament.totalRounds 
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start tournament',
        });
      }
    }),

  getBracket: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament || !tournament.config) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found or not started',
          });
        }

        // Recreate tournament engine from saved state
        const engine = TournamentEngine.importState({
          config: tournament.config,
          playerMap: [],
          tournamentState: null
        });

        // Get bracket data
        const bracketData = engine.getBracketData();
        
        const bracket: BracketData = {
          rounds: Object.keys(bracketData).map(roundNum => ({
            roundNumber: parseInt(roundNum),
            name: getRoundName(parseInt(roundNum), tournament.format),
            matches: bracketData[roundNum]
          })),
          format: tournament.format,
          isComplete: tournament.isComplete || false
        };

        return bracket;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bracket',
        });
      }
    }),

  getStandings: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament || !tournament.config) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found or not started',
          });
        }

        // Get teams and matches
        const [teamsResult, matchesResult] = await Promise.all([
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' AND tournamentId = $1`,
            { parameters: [input.slug] }
          ),
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'match' AND tournamentId = $1`,
            { parameters: [input.slug] }
          )
        ]);

        const teams = teamsResult.rows as Team[];
        const matches = matchesResult.rows as Match[];

        // Calculate standings
        const standings = calculateStandings(teams, matches, tournament);

        return standings;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch standings',
        });
      }
    }),

  getStatsBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }

        // Get teams and matches
        const [teamsResult, matchesResult] = await Promise.all([
          query(
            `SELECT COUNT(*) as count FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'team' AND tournamentId = $1`,
            { parameters: [input.slug] }
          ),
          query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'match' AND tournamentId = $1`,
            { parameters: [input.slug] }
          )
        ]);

        const teamCount = teamsResult.rows[0]?.count || 0;
        const matches = matchesResult.rows as Match[];
        
        const completedMatches = matches.filter(m => m.isComplete);
        const totalPoints = completedMatches.reduce((sum, m) => 
          sum + (m.finalScore?.a || 0) + (m.finalScore?.b || 0), 0);

        const stats: TournamentStats = {
          tournamentId: input.slug,
          totalTeams: teamCount,
          totalMatches: matches.length,
          completedMatches: completedMatches.length,
          remainingMatches: matches.length - completedMatches.length,
          currentRound: tournament.currentRound || 1,
          totalRounds: tournament.totalRounds || 1,
          totalPoints,
          highestScore: Math.max(...completedMatches.flatMap(m => [m.finalScore?.a || 0, m.finalScore?.b || 0])),
          lowestScore: Math.min(...completedMatches.flatMap(m => [m.finalScore?.a || 0, m.finalScore?.b || 0])),
          mostWins: 0, // TODO: Calculate from standings
          winningStreak: 0, // TODO: Calculate from match history
          upsetCount: 0, // TODO: Calculate based on seeding
          completionPercentage: matches.length > 0 ? (completedMatches.length / matches.length) * 100 : 0
        };

        return stats;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tournament stats',
        });
      }
    }),

  // Inherit other endpoints from original router
  setOpen: protectedProcedure
    .input(z.object({
      slug: z.string(),
      isOpen: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tournament not found',
          });
        }
        
        if (tournament.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not authorized to modify this tournament',
          });
        }
        
        tournament.isOpen = input.isOpen;
        tournament.updatedAt = new Date().toISOString();
        
        await upsertDocument(`tournament::${input.slug}`, tournament);
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tournament',
        });
      }
    }),

  listTeams: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const result = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1
           ORDER BY createdAt`,
          { parameters: [input.tournamentId] }
        );
        
        return result.rows as Team[];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch teams',
        });
      }
    }),

  // Create a mega-tournament with multiple sub-tournaments
  createMegaTournament: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      subTournaments: z.array(z.object({
        name: z.string(),
        format: tournamentFormatSchema,
        maxTeams: z.number().min(2).max(128),
        pointsForPlacement: z.record(z.number()).optional() // { 1: 100, 2: 75, 3: 50, ... }
      })),
      bonusChallenges: z.array(bonusChallengeSchema).optional(),
      megaScoringMethod: z.enum(['placement', 'points', 'hybrid']).default('placement')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Create the mega-tournament
        const megaSlug = input.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50) + '-mega-' + nanoid(6);
        
        const megaTournament: Tournament = {
          _type: 'tournament',
          slug: megaSlug,
          name: input.name,
          date: input.date,
          ownerId: ctx.user.id,
          isOpen: true,
          format: 'round_robin', // Mega tournaments track overall points
          maxTeams: 999, // Allow many teams
          isMegaTournament: true,
          subTournamentIds: [],
          settings: {
            megaTournamentScoring: {
              method: input.megaScoringMethod,
              placementPoints: input.subTournaments[0]?.pointsForPlacement 
                ? Object.fromEntries(
                    Object.entries(input.subTournaments[0].pointsForPlacement).map(([k, v]) => [Number(k), v])
                  )
                : { 1: 100, 2: 75, 3: 50, 4: 25 },
              bonusPointsEnabled: !!input.bonusChallenges?.length
            },
            bonusChallenges: input.bonusChallenges || []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await upsertDocument(`tournament::${megaSlug}`, megaTournament);
        
        // Create all sub-tournaments
        const subTournamentSlugs: string[] = [];
        
        for (const subTournament of input.subTournaments) {
          const subSlug = subTournament.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) + '-' + nanoid(6);
          
          const subTournamentDoc: Tournament = {
            _type: 'tournament',
            slug: subSlug,
            name: subTournament.name,
            date: input.date,
            ownerId: ctx.user.id,
            isOpen: true,
            format: subTournament.format,
            maxTeams: subTournament.maxTeams,
            parentTournamentId: megaSlug,
            settings: {
              venue: megaTournament.settings?.venue
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await upsertDocument(`tournament::${subSlug}`, subTournamentDoc);
          subTournamentSlugs.push(subSlug);
        }
        
        // Update mega tournament with sub-tournament IDs
        megaTournament.subTournamentIds = subTournamentSlugs;
        await upsertDocument(`tournament::${megaSlug}`, megaTournament);
        
        return { 
          megaTournament: megaTournament,
          subTournaments: subTournamentSlugs.map((slug, index) => ({
            slug,
            name: input.subTournaments[index].name,
            format: input.subTournaments[index].format,
            maxTeams: input.subTournaments[index].maxTeams,
          }))
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create mega tournament',
        });
      }
    }),

  // Get mega-tournament leaderboard
  getMegaTournamentLeaderboard: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.slug}`) as Tournament;
        
        if (!tournament || !tournament.isMegaTournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Mega tournament not found',
          });
        }
        
        // Get all mega tournament scores
        const result = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'mega_tournament_score' AND megaTournamentId = $1
           ORDER BY totalPoints DESC`,
          { parameters: [input.slug] }
        );
        
        return result.rows;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch mega tournament leaderboard',
        });
      }
    }),

  // Complete bonus challenge
  completeBonusChallenge: protectedProcedure
    .input(z.object({
      megaTournamentSlug: z.string(),
      teamId: z.string(),
      challengeId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const tournament = await getDocument(`tournament::${input.megaTournamentSlug}`) as Tournament;
        
        if (!tournament || !tournament.isMegaTournament) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Mega tournament not found',
          });
        }
        
        const challenge = tournament.settings?.bonusChallenges?.find(c => c.id === input.challengeId);
        if (!challenge) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bonus challenge not found',
          });
        }
        
        // Get or create mega tournament score
        const scoreId = `mega_tournament_score::${input.megaTournamentSlug}::${input.teamId}`;
        let score = await getDocument(scoreId) as any;
        
        if (!score) {
          score = {
            _type: 'mega_tournament_score',
            megaTournamentId: input.megaTournamentSlug,
            teamId: input.teamId,
            totalPoints: 0,
            placementPoints: 0,
            bonusPoints: 0,
            tournamentScores: {},
            bonusCompletions: []
          };
        }
        
        // Check if already completed
        const completions = score.bonusCompletions.filter((c: any) => c.challengeId === input.challengeId);
        if (completions.length >= (challenge.maxCompletions || 1)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Bonus challenge already completed maximum times',
          });
        }
        
        // Add bonus completion
        score.bonusCompletions.push({
          challengeId: input.challengeId,
          completedAt: new Date().toISOString(),
          points: challenge.points
        });
        
        score.bonusPoints += challenge.points;
        score.totalPoints += challenge.points;
        score.updatedAt = new Date().toISOString();
        
        await upsertDocument(scoreId, score);
        
        return { ok: true, newTotalPoints: score.totalPoints };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete bonus challenge',
        });
      }
    }),

  // Get tournament leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        // Get teams for this tournament
        const teamsResult = await query(
          `SELECT id, name, colorHex, flagCode 
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND tournamentId = $1`,
          { parameters: [input.tournamentId] }
        );
        
        // Get score totals
        const scoresResult = await query(
          `SELECT teamId, SUM(points) as totalPoints, COUNT(*) as matchesPlayed,
                  SUM(CASE WHEN reason LIKE 'Won %' THEN 1 ELSE 0 END) as wins,
                  SUM(CASE WHEN reason LIKE 'Played %' AND reason NOT LIKE 'Won %' THEN 1 ELSE 0 END) as losses
           FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_entry' AND tournamentId = $1
           GROUP BY teamId`,
          { parameters: [input.tournamentId] }
        );
        
        // Create score map
        const scoreMap = new Map<string, any>();
        scoresResult.rows.forEach((row: any) => {
          scoreMap.set(row.teamId, {
            points: row.totalPoints || 0,
            matchesPlayed: row.matchesPlayed || 0,
            wins: row.wins || 0,
            losses: row.losses || 0
          });
        });
        
        // Combine teams with scores
        const leaderboard = teamsResult.rows.map((team: any, index: number) => {
          const stats = scoreMap.get(team.id) || { points: 0, matchesPlayed: 0, wins: 0, losses: 0 };
          return {
            id: team.id,
            name: team.name,
            color: team.colorHex,
            flagCode: team.flagCode,
            rank: index + 1, // Will be recalculated after sorting
            points: stats.points,
            wins: stats.wins,
            losses: stats.losses,
            gamesPlayed: stats.matchesPlayed
          };
        });
        
        // Sort by points and assign ranks
        leaderboard.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.wins - a.wins;
        });
        
        // Update ranks
        leaderboard.forEach((team, index) => {
          team.rank = index + 1;
        });
        
        return leaderboard;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leaderboard',
        });
      }
    })
});

// Helper functions
function getRoundName(roundNumber: number, format: TournamentFormat): string {
  if (format === 'round_robin') {
    return `Round ${roundNumber}`;
  }
  
  // For elimination tournaments, name rounds based on remaining teams
  const roundNames = ['Finals', 'Semifinals', 'Quarterfinals', 'Round of 16', 'Round of 32'];
  return roundNames[roundNames.length - roundNumber] || `Round ${roundNumber}`;
}

function calculateStandings(teams: Team[], matches: Match[], tournament: Tournament): Standings {
  const standings = teams.map(team => {
    const teamMatches = matches.filter(m => m.teamA === team.id || m.teamB === team.id);
    const completedMatches = teamMatches.filter(m => m.isComplete);
    
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    
    completedMatches.forEach(match => {
      const isTeamA = match.teamA === team.id;
      const teamScore = isTeamA ? match.finalScore?.a || 0 : match.finalScore?.b || 0;
      const opponentScore = isTeamA ? match.finalScore?.b || 0 : match.finalScore?.a || 0;
      
      pointsFor += teamScore;
      pointsAgainst += opponentScore;
      
      if ((teamScore ?? 0) > (opponentScore ?? 0)) {
        wins++;
      } else {
        losses++;
      }
    });
    
    const points = wins * (tournament.settings?.pointsPerWin || 3) + losses * (tournament.settings?.pointsPerLoss || 0);
    
    return {
      seed: teams.indexOf(team) + 1,
      teamId: team.id,
      teamName: team.name,
      position: 0, // Will be calculated after sorting
      wins,
      losses,
      points,
      pointsFor,
      pointsAgainst,
      pointsDifferential: pointsFor - pointsAgainst,
      matchesPlayed: completedMatches.length,
      winPercentage: completedMatches.length > 0 ? wins / completedMatches.length : 0
    };
  });
  
  // Sort by points, then by point differential
  standings.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    return b.pointsDifferential - a.pointsDifferential;
  });
  
  // Assign positions
  standings.forEach((entry, index) => {
    entry.position = index + 1;
  });
  
  return {
    tournamentId: tournament.slug,
    format: tournament.format,
    lastUpdated: new Date().toISOString(),
    players: standings,
    isComplete: tournament.isComplete || false,
    currentRound: tournament.currentRound,
    totalRounds: tournament.totalRounds
  };
}