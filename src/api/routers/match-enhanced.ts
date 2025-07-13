/**
 * Enhanced Match Router with Advanced Scoring and Real-time Updates
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getDocument, upsertDocument, query } from '../../services/couchbase';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { TournamentEngine } from '../../services/tournament-engine';
import type { 
  Match, 
  ScoreSubmission, 
  ScoreEntry, 
  Event, 
  Tournament,
  Team,
  PlayerProfile,
  MegaTournamentScore
} from '../../types';

// Helper to update tournament state after match
async function updateTournamentState(match: Match, winnerId: string) {
  const tournament = await getDocument(`tournament::${match.tournamentId}`) as Tournament;
  
  if (!tournament || !tournament.config) {
    return;
  }
  
  // Recreate tournament engine from saved state
  const engine = TournamentEngine.importState({
    config: tournament.config,
    playerMap: [],
    tournamentState: null
  });
  
  // Report match result
  if (match.tournamentMatchId) {
    const teams = await query(
      `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
       WHERE _type = 'team' AND tournamentId = $1`,
      { parameters: [match.tournamentId] }
    );
    
    // const winnerTeam = teams.rows.find((t: Team) => t.id === winnerId); // Not used currently
    const winnerIndex = teams.rows.findIndex((t: Team) => t.id === winnerId) + 1;
    
    engine.scoreMatch(match.tournamentMatchId, [winnerIndex === 1 ? 1 : 0, winnerIndex === 2 ? 1 : 0]);
  }
  
  // Check if round is complete
  const matches = engine.getMatches();
  const currentRoundMatches = matches.filter(m => m.id.r === tournament.currentRound);
  const completedRoundMatches = currentRoundMatches.filter(m => m.m !== null);
  
  if (currentRoundMatches.length === completedRoundMatches.length && tournament.currentRound) {
    tournament.currentRound++;
  }
  
  // Check if tournament is complete
  tournament.isComplete = engine.isComplete();
  
  // Save updated tournament state
  tournament.config = engine.exportState().config;
  tournament.updatedAt = new Date().toISOString();
  
  await upsertDocument(`tournament::${match.tournamentId}`, tournament);
}

// Helper to update player stats
async function updatePlayerStats(match: Match, winnerId: string, scores: { a: number; b: number }) {
  const winnerTeam = await getDocument(`team::${winnerId}`) as Team;
  const loserTeamId = match.teamA === winnerId ? match.teamB : match.teamA;
  const loserTeam = loserTeamId ? await getDocument(`team::${loserTeamId}`) as Team : null;
  
  if (!winnerTeam) return;
  
  // Update stats for all players
  const allPlayerIds = [...winnerTeam.memberIds, ...(loserTeam?.memberIds || [])];
  
  for (const playerId of allPlayerIds) {
    const profile = await getDocument(`player_profile::${playerId}`) as PlayerProfile;
    if (!profile) continue;
    
    const isWinner = winnerTeam.memberIds.includes(playerId);
    const playerScore = isWinner ? 
      (winnerId === match.teamA ? scores.a : scores.b) :
      (winnerId === match.teamA ? scores.b : scores.a);
    
    // Update basic stats
    profile.stats.totalGamesPlayed++;
    if (isWinner) {
      profile.stats.totalWins++;
      profile.stats.currentStreak++;
      profile.stats.longestStreak = Math.max(profile.stats.longestStreak, profile.stats.currentStreak);
    } else {
      profile.stats.totalLosses++;
      profile.stats.currentStreak = 0;
    }
    
    profile.stats.totalPoints += playerScore;
    profile.stats.winRate = (profile.stats.totalWins / profile.stats.totalGamesPlayed) * 100;
    profile.stats.averagePointsPerGame = profile.stats.totalPoints / profile.stats.totalGamesPlayed;
    
    // Update game-specific stats
    if (match.eventId) {
      const event = await getDocument(`event::${match.eventId}`) as Event;
      if (event) {
        if (!profile.stats.gameStats[event.name]) {
          profile.stats.gameStats[event.name] = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            averageScore: 0,
            bestScore: 0,
            lastPlayed: new Date().toISOString()
          };
        }
        
        const gameStats = profile.stats.gameStats[event.name];
        gameStats.gamesPlayed++;
        if (isWinner) {
          gameStats.wins++;
        } else {
          gameStats.losses++;
        }
        gameStats.bestScore = Math.max(gameStats.bestScore, playerScore);
        gameStats.lastPlayed = new Date().toISOString();
        
        // Recalculate average
        const allGameScores = await query(
          `SELECT m.finalScore FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
           WHERE m._type = 'match' 
           AND m.eventId = $1
           AND m.isComplete = true
           AND (m.teamA IN (SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default WHERE _type = 'team' AND $2 IN memberIds)
                OR m.teamB IN (SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default WHERE _type = 'team' AND $2 IN memberIds))`,
          { parameters: [match.eventId, playerId] }
        );
        
        let totalScore = 0;
        let count = 0;
        allGameScores.rows.forEach((row: Record<string, unknown>) => {
          // Calculate player's score from the match
          // This is simplified - in reality we'd need to determine which team the player was on
          const finalScore = row.finalScore as { a?: number; b?: number } | undefined;
          totalScore += Math.max(finalScore?.a || 0, finalScore?.b || 0);
          count++;
        });
        
        gameStats.averageScore = count > 0 ? totalScore / count : 0;
      }
    }
    
    profile.updatedAt = new Date().toISOString();
    await upsertDocument(`player_profile::${playerId}`, profile);
  }
}

// Helper to update mega-tournament scores
async function updateMegaTournamentScores(match: Match, _winnerId: string, _scores: { a: number; b: number }) {
  const tournament = await getDocument(`tournament::${match.tournamentId}`) as Tournament;
  
  if (!tournament || !tournament.parentTournamentId) {
    return; // Not a sub-tournament
  }
  
  const megaTournament = await getDocument(`tournament::${tournament.parentTournamentId}`) as Tournament;
  if (!megaTournament || !megaTournament.isMegaTournament) {
    return;
  }
  
  // Update scores for both teams
  const teams = [match.teamA, match.teamB].filter(Boolean);
  
  for (const teamId of teams) {
    if (!teamId) continue;
    
    const scoreId = `mega_tournament_score::${tournament.parentTournamentId}::${teamId}`;
    let megaScore = await getDocument(scoreId) as MegaTournamentScore;
    
    if (!megaScore) {
      megaScore = {
        _type: 'mega_tournament_score',
        megaTournamentId: tournament.parentTournamentId,
        teamId,
        totalPoints: 0,
        placementPoints: 0,
        bonusPoints: 0,
        tournamentScores: {},
        bonusCompletions: [],
        updatedAt: new Date().toISOString()
      };
    }
    
    // Add participation points if configured
    const participationPoints = megaTournament.settings?.megaTournamentScoring?.participationPoints || 0;
    
    if (!megaScore.tournamentScores[match.tournamentId]) {
      megaScore.tournamentScores[match.tournamentId] = {
        placement: 0, // Will be updated when tournament ends
        points: participationPoints,
        bonusPoints: 0
      };
      megaScore.totalPoints += participationPoints;
    }
    
    megaScore.updatedAt = new Date().toISOString();
    await upsertDocument(scoreId, megaScore);
  }
}

export const enhancedMatchRouter = router({
  // Submit match score with enhanced validation
  submitScore: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      winnerTeamId: z.string(),
      score: z.object({
        a: z.number().min(0),
        b: z.number().min(0),
      }).strict(),
      mediaUrls: z.array(z.string().url()).optional(),
      notes: z.string().max(500).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify match exists and is not complete
        const match = await getDocument(`match::${input.matchId}`) as Match;
        if (!match) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Match not found',
          });
        }
        
        if (match.isComplete) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Match already completed',
          });
        }
        
        // Verify winner is one of the teams
        if (input.winnerTeamId !== match.teamA && input.winnerTeamId !== match.teamB) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Winner must be one of the match teams',
          });
        }
        
        // Verify score matches winner
        const winnerIsTeamA = input.winnerTeamId === match.teamA;
        if ((winnerIsTeamA && input.score.a <= input.score.b) || 
            (!winnerIsTeamA && input.score.b <= input.score.a)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Score does not match winner',
          });
        }
        
        // Check if user is authorized to submit score
        const userTeams = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND $1 IN memberIds`,
          { parameters: [ctx.user.id] }
        );
        
        const userTeamIds = userTeams.rows.map((row: Record<string, unknown>) => row.id as string);
        const isParticipant = (match.teamA && userTeamIds.includes(match.teamA)) || (match.teamB && userTeamIds.includes(match.teamB));
        
        if (!isParticipant) {
          // Check if user is tournament owner or admin
          const tournament = await getDocument(`tournament::${match.tournamentId}`) as Tournament;
          if (tournament?.ownerId !== ctx.user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Only match participants or tournament owner can submit scores',
            });
          }
        }
        
        // Check for existing pending submissions
        const existingSubmissions = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_submission' AND matchId = $1 AND status = 'PENDING'`,
          { parameters: [input.matchId] }
        );
        
        if (existingSubmissions.rows.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Score submission already pending for this match',
          });
        }
        
        const submissionId = nanoid();
        const submission: ScoreSubmission = {
          _type: 'score_submission',
          id: submissionId,
          matchId: input.matchId,
          reporterId: ctx.user.id,
          winnerId: input.winnerTeamId,
          score: input.score,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        
        await upsertDocument(`score_submission::${submissionId}`, submission);
        
        // Store media if provided
        if (input.mediaUrls && input.mediaUrls.length > 0) {
          for (const url of input.mediaUrls) {
            const mediaId = nanoid();
            await upsertDocument(`media::${mediaId}`, {
              _type: 'media',
              id: mediaId,
              matchId: input.matchId,
              uploaderId: ctx.user.id,
              kind: url.includes('.mp4') || url.includes('.mov') ? 'video' : 'photo',
              url,
              createdAt: new Date().toISOString()
            });
            
            // Add media ID to match
            match.mediaIds.push(mediaId);
          }
          await upsertDocument(`match::${input.matchId}`, match);
        }
        
        // Auto-confirm after timeout
        if (process.env.NODE_ENV !== 'test') {
          setTimeout(async () => {
            try {
              await confirmScore(submissionId);
            } catch (error) {
              console.error('Failed to auto-confirm score:', error);
            }
          }, 5 * 60 * 1000); // 5 minutes
        }
        
        return { submissionId };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit score',
        });
      }
    }),

  // Enhanced score confirmation with notifications
  confirmScore: protectedProcedure
    .input(z.object({
      submissionId: z.string(),
      confirm: z.boolean(),
      disputeReason: z.string().max(500).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const submission = await getDocument(`score_submission::${input.submissionId}`) as ScoreSubmission;
        
        if (!submission) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Score submission not found',
          });
        }
        
        if (submission.status !== 'PENDING') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Score submission already processed',
          });
        }
        
        // Verify user is from opposing team
        const match = await getDocument(`match::${submission.matchId}`) as Match;
        const userTeams = await query(
          `SELECT id FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'team' AND $1 IN memberIds`,
          { parameters: [ctx.user.id] }
        );
        
        const userTeamIds = userTeams.rows.map((row: Record<string, unknown>) => row.id as string);
        // const reporterTeamId = userTeamIds.find(id => id === match.teamA || id === match.teamB);
        const opposingTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
        
        if (opposingTeamId && !userTeamIds.includes(opposingTeamId)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only opposing team members can confirm scores',
          });
        }
        
        if (input.confirm) {
          await confirmScore(input.submissionId);
        } else {
          // Create dispute
          submission.status = 'DISPUTED';
          submission.disputedBy = ctx.user.id;
          submission.disputedAt = new Date().toISOString();
          await upsertDocument(`score_submission::${input.submissionId}`, submission);
          
          // Create dispute record
          const disputeId = nanoid();
          await upsertDocument(`dispute::${disputeId}`, {
            _type: 'dispute',
            id: disputeId,
            submissionId: input.submissionId,
            matchId: submission.matchId,
            tournamentId: match.tournamentId,
            disputedBy: ctx.user.id,
            reason: input.disputeReason || 'Score disputed',
            status: 'OPEN',
            createdAt: new Date().toISOString()
          });
          
          // Notify tournament owner
          // Real-time notification would be handled here
        }
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process score confirmation',
        });
      }
    }),

  // Get match details with all related data
  getMatchDetails: publicProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const match = await getDocument(`match::${input.matchId}`) as Match;
        
        if (!match) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Match not found',
          });
        }
        
        // Get teams
        const [teamA, teamB] = await Promise.all([
          match.teamA ? getDocument(`team::${match.teamA}`) as Promise<Team> : null,
          match.teamB ? getDocument(`team::${match.teamB}`) as Promise<Team> : null
        ]);
        
        // Get event details
        const event = match.eventId ? await getDocument(`event::${match.eventId}`) as Event : null;
        
        // Get score submission if pending
        const pendingSubmission = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_submission' AND matchId = $1 AND status = 'PENDING'
           LIMIT 1`,
          { parameters: [input.matchId] }
        );
        
        // Get media
        const media = match.mediaIds.length > 0 ? await Promise.all(
          match.mediaIds.map(id => getDocument(`media::${id}`))
        ) : [];
        
        // Get head-to-head history
        let h2hHistory = [];
        if (teamA && teamB) {
          const h2hResult = await query(
            `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
             WHERE _type = 'match' 
             AND isComplete = true
             AND ((teamA = $1 AND teamB = $2) OR (teamA = $2 AND teamB = $1))
             AND id != $3
             ORDER BY endTime DESC
             LIMIT 5`,
            { parameters: [teamA.id, teamB.id, input.matchId] }
          );
          h2hHistory = h2hResult.rows;
        }
        
        return {
          match,
          teamA,
          teamB,
          event,
          pendingSubmission: pendingSubmission.rows[0] || null,
          media: media.filter(m => m !== null),
          headToHeadHistory: h2hHistory,
          canSubmitScore: !match.isComplete && !pendingSubmission.rows.length
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match details',
        });
      }
    }),

  // Get upcoming matches with smart scheduling
  getUpcomingMatches: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      teamId: z.string().optional(),
      limit: z.number().min(1).max(50).default(20)
    }))
    .query(async ({ input }) => {
      try {
        let query_str = `
          SELECT m.*, e.name as eventName, ta.name as teamAName, tb.name as teamBName
          FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default m
          LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default e ON e.id = m.eventId
          LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default ta ON ta.id = m.teamA
          LEFT JOIN \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default tb ON tb.id = m.teamB
          WHERE m._type = 'match' 
          AND m.tournamentId = $1
          AND m.isComplete = false`;
        
        const params: any[] = [input.tournamentId];
        
        if (input.teamId) {
          query_str += ` AND (m.teamA = $2 OR m.teamB = $2)`;
          params.push(input.teamId);
        }
        
        query_str += ` ORDER BY m.round, m.scheduledTime, m.createdAt LIMIT $${params.length + 1}`;
        params.push(input.limit);
        
        const result = await query(query_str, { parameters: params });
        
        return result.rows.map((match: any) => ({
          ...match,
          estimatedStartTime: match.scheduledTime || estimateMatchStartTime(match),
          canStart: canStartMatch(match)
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch upcoming matches',
        });
      }
    }),

  // Resolve dispute
  resolveDispute: protectedProcedure
    .input(z.object({
      disputeId: z.string(),
      resolution: z.enum(['accept_original', 'override_score', 'rematch']),
      overrideScore: z.object({
        a: z.number().min(0),
        b: z.number().min(0),
        winnerId: z.string()
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const dispute = await getDocument(`dispute::${input.disputeId}`) as any;
        
        if (!dispute) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Dispute not found',
          });
        }
        
        const match = await getDocument(`match::${dispute.matchId}`) as Match;
        const tournament = await getDocument(`tournament::${match.tournamentId}`) as Tournament;
        
        // Only tournament owner can resolve disputes
        if (tournament.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only tournament owner can resolve disputes',
          });
        }
        
        const submission = await getDocument(`score_submission::${dispute.submissionId}`) as ScoreSubmission;
        
        switch (input.resolution) {
          case 'accept_original':
            // Accept the original score
            await confirmScore(dispute.submissionId);
            break;
            
          case 'override_score':
            // Override with new score
            if (!input.overrideScore) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Override score required',
              });
            }
            
            submission.winnerId = input.overrideScore.winnerId;
            submission.score = { a: input.overrideScore.a, b: input.overrideScore.b };
            await upsertDocument(`score_submission::${dispute.submissionId}`, submission);
            await confirmScore(dispute.submissionId);
            break;
            
          case 'rematch':
            // Mark current match as void and create new one
            match.isComplete = true;
            match.notes = 'Match voided due to dispute - rematch scheduled';
            await upsertDocument(`match::${dispute.matchId}`, match);
            
            // Create rematch
            const rematchId = nanoid();
            const rematch: Match = {
              ...match,
              id: rematchId,
              isComplete: false,
              winner: undefined,
              finalScore: undefined,
              mediaIds: [],
              notes: 'Rematch due to dispute',
              createdAt: new Date().toISOString()
            };
            
            await upsertDocument(`match::${rematchId}`, rematch);
            break;
        }
        
        // Update dispute status
        dispute.status = 'RESOLVED';
        dispute.resolution = input.resolution;
        dispute.resolvedBy = ctx.user.id;
        dispute.resolvedAt = new Date().toISOString();
        await upsertDocument(`dispute::${input.disputeId}`, dispute);
        
        return { ok: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resolve dispute',
        });
      }
    }),

  // Get match timeline with all events
  getMatchTimeline: publicProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const match = await getDocument(`match::${input.matchId}`) as Match;
        
        if (!match) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Match not found',
          });
        }
        
        // Get all related events
        const events = [];
        
        // Match created
        events.push({
          type: 'match_created',
          timestamp: match.createdAt,
          description: 'Match created'
        });
        
        // Match started
        if (match.startTime) {
          events.push({
            type: 'match_started',
            timestamp: match.startTime,
            description: 'Match started'
          });
        }
        
        // Score submissions
        const submissions = await query(
          `SELECT * FROM \`${process.env.COUCHBASE_BUCKET || 'beer_olympics'}\`._default._default
           WHERE _type = 'score_submission' AND matchId = $1
           ORDER BY createdAt`,
          { parameters: [input.matchId] }
        );
        
        submissions.rows.forEach((submission: ScoreSubmission) => {
          events.push({
            type: 'score_submitted',
            timestamp: submission.createdAt,
            description: `Score submitted: ${submission.score.a}-${submission.score.b}`,
            data: submission
          });
          
          if (submission.status === 'DISPUTED' && submission.disputedAt) {
            events.push({
              type: 'score_disputed',
              timestamp: submission.disputedAt,
              description: 'Score disputed'
            });
          }
          
          if (submission.status === 'CONFIRMED' && submission.confirmedAt) {
            events.push({
              type: 'score_confirmed',
              timestamp: submission.confirmedAt,
              description: 'Score confirmed'
            });
          }
        });
        
        // Match completed
        if (match.endTime) {
          events.push({
            type: 'match_completed',
            timestamp: match.endTime,
            description: `Match completed: ${match.finalScore?.a}-${match.finalScore?.b}`
          });
        }
        
        // Sort by timestamp
        events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        return events;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match timeline',
        });
      }
    })
});

// Helper functions
async function confirmScore(submissionId: string) {
  try {
    // Get submission
    const submission = await getDocument(`score_submission::${submissionId}`) as ScoreSubmission;
    if (!submission || submission.status !== 'PENDING') {
      return; // Already processed
    }
    
    // Get match
    const match = await getDocument(`match::${submission.matchId}`) as Match;
    if (!match || match.isComplete) {
      return; // Match already completed
    }
    
    // Update match
    match.winner = submission.winnerId;
    match.isComplete = true;
    match.endTime = new Date().toISOString();
    match.finalScore = submission.score;
    await upsertDocument(`match::${submission.matchId}`, match);
    
    // Update submission status
    submission.status = 'CONFIRMED';
    submission.confirmedAt = new Date().toISOString();
    await upsertDocument(`score_submission::${submissionId}`, submission);
    
    // Update tournament state
    await updateTournamentState(match, submission.winnerId);
    
    // Update player stats
    await updatePlayerStats(match, submission.winnerId, submission.score);
    
    // Update mega-tournament scores if applicable
    await updateMegaTournamentScores(match, submission.winnerId, submission.score);
    
    // Get event to determine scoring
    const event = match.eventId ? await getDocument(`event::${match.eventId}`) as Event : null;
    
    if (event) {
      // Create score entries based on event scoring rules
      const winnerPoints = event.scoring?.win || 10;
      const loserPoints = event.scoring?.loss || 5;
      
      const winnerEntry: ScoreEntry = {
        _type: 'score_entry',
        id: nanoid(),
        tournamentId: event.tournamentId,
        eventId: match.eventId || '',
        teamId: submission.winnerId,
        points: winnerPoints,
        reason: `Won ${event.name}`,
        createdAt: new Date().toISOString(),
      };
      
      const loserTeamId = match.teamA === submission.winnerId ? match.teamB : match.teamA;
      if (loserTeamId) {
        const loserEntry: ScoreEntry = {
          _type: 'score_entry',
          id: nanoid(),
          tournamentId: event.tournamentId,
          eventId: match.eventId || '',
          teamId: loserTeamId,
          points: loserPoints,
          reason: `Played ${event.name}`,
          createdAt: new Date().toISOString(),
        };
        
        await upsertDocument(`score_entry::${loserEntry.id}`, loserEntry);
      }
      
      await upsertDocument(`score_entry::${winnerEntry.id}`, winnerEntry);
    }
    
    // Send real-time updates
    // This would trigger WebSocket notifications
  } catch (error) {
    console.error('Failed to confirm score:', error);
    throw error;
  }
}

function estimateMatchStartTime(match: any): string {
  // Simple estimation based on round and creation time
  const baseTime = new Date(match.createdAt);
  const hoursPerRound = 2;
  baseTime.setHours(baseTime.getHours() + (match.round - 1) * hoursPerRound);
  return baseTime.toISOString();
}

function canStartMatch(match: any): boolean {
  // Check if previous round matches are complete
  // This is a simplified check
  return match.round === 1 || match.teamA && match.teamB;
}