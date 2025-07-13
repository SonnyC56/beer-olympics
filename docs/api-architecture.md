# Beer Olympics API Architecture

## Overview
This document outlines the enhanced tRPC router architecture for the Beer Olympics application, designed for scalability, real-time operations, and comprehensive tournament management.

## Architecture Principles

1. **Type Safety**: Full end-to-end type safety with tRPC and Zod
2. **Modular Design**: Separate routers for different domains
3. **Real-time First**: WebSocket subscriptions for live updates
4. **Performance**: Optimistic updates and intelligent caching
5. **Security**: Role-based access control and input validation
6. **Error Handling**: Consistent error responses and recovery

## Router Structure

### Core Router Organization
```
/api/routers/
├── index.ts                 # Root router aggregation
├── auth.ts                  # Authentication & authorization
├── tournament.ts            # Tournament management
├── mega-tournament.ts       # Mega tournament specific operations
├── team.ts                  # Team management
├── player.ts                # Player profiles and stats
├── match.ts                 # Match operations
├── scoring.ts               # Score submission and validation
├── leaderboard.ts          # Rankings and statistics
├── media.ts                # Media upload and management
├── achievement.ts          # Achievements and awards
├── realtime.ts            # WebSocket subscriptions
├── analytics.ts           # Analytics and reporting
└── admin.ts               # Administrative operations
```

## Detailed Router Specifications

### 1. Authentication Router (`auth.ts`)
```typescript
export const authRouter = router({
  // Session management
  login: publicProcedure
    .input(z.object({
      provider: z.enum(['google', 'email', 'apple']),
      credentials: z.any()
    }))
    .mutation(async ({ input }) => {
      // OAuth flow or email/password
      return { user, session, token };
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Invalidate session
      return { success: true };
    }),

  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      // Refresh access token
      return { accessToken, refreshToken };
    }),

  // User management
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string()
    }))
    .mutation(async ({ input }) => {
      // Create user account
      return { user, session };
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      // Get current user with roles
      return { user: ctx.user, permissions: ctx.permissions };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().url().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user profile
      return { user: updatedUser };
    }),

  // Role management
  requestRole: protectedProcedure
    .input(z.object({
      role: z.enum(['organizer', 'referee', 'scorekeeper']),
      tournamentId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Request elevated role
      return { request: roleRequest };
    })
});
```

### 2. Tournament Router (`tournament.ts`)
```typescript
export const tournamentRouter = router({
  // Tournament CRUD
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      date: z.string().datetime(),
      format: z.enum(['single_elimination', 'double_elimination', 'round_robin', 'group_stage']),
      maxTeams: z.number().min(4).max(256),
      games: z.array(GameConfigSchema),
      settings: TournamentSettingsSchema.optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create tournament with slug generation
      return { tournament, slug };
    }),

  update: organizerProcedure
    .input(z.object({
      slug: z.string(),
      updates: TournamentUpdateSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Update tournament settings
      return { tournament };
    }),

  delete: organizerProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete tournament
      return { success: true };
    }),

  // Tournament queries
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Get tournament with full details
      return { tournament, isRegistrationOpen, spotsRemaining };
    }),

  list: publicProcedure
    .input(z.object({
      status: z.enum(['upcoming', 'active', 'completed']).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ input }) => {
      // List tournaments with pagination
      return { tournaments, nextCursor };
    }),

  myTournaments: protectedProcedure
    .input(z.object({
      role: z.enum(['player', 'organizer', 'all']).default('all')
    }))
    .query(async ({ input, ctx }) => {
      // Get user's tournaments
      return { tournaments };
    }),

  // Tournament operations
  start: organizerProcedure
    .input(z.object({
      slug: z.string(),
      seedingMethod: z.enum(['random', 'manual', 'ranking']).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Generate brackets and start tournament
      return { tournament, brackets, firstRoundMatches };
    }),

  generateBrackets: organizerProcedure
    .input(z.object({
      slug: z.string(),
      preview: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      // Generate or preview brackets
      return { brackets, matches };
    }),

  advanceRound: organizerProcedure
    .input(z.object({
      slug: z.string(),
      round: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Advance to next round
      return { tournament, nextMatches };
    }),

  // Tournament state
  getState: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Get current tournament state
      return { 
        status,
        currentRound,
        totalRounds,
        phase,
        nextMatchTime,
        canAdvance
      };
    }),

  // Statistics
  getStats: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Get tournament statistics
      return { stats: TournamentStats };
    })
});
```

### 3. Mega Tournament Router (`mega-tournament.ts`)
```typescript
export const megaTournamentRouter = router({
  // Mega tournament creation
  create: organizerProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      subTournaments: z.array(z.object({
        name: z.string(),
        format: TournamentFormatSchema,
        gameId: z.string(),
        scheduledTime: z.string().datetime()
      })),
      scoring: MegaTournamentScoringSchema,
      bonusChallenges: z.array(BonusChallengeSchema).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create mega tournament with sub-tournaments
      return { megaTournament, subTournaments };
    }),

  // Bonus challenges
  addBonusChallenge: organizerProcedure
    .input(z.object({
      megaTournamentId: z.string(),
      challenge: BonusChallengeSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Add bonus challenge
      return { challenge };
    }),

  completeBonusChallenge: protectedProcedure
    .input(z.object({
      megaTournamentId: z.string(),
      challengeId: z.string(),
      teamId: z.string(),
      evidence: z.any() // Photos, videos, witness confirmations
    }))
    .mutation(async ({ input, ctx }) => {
      // Submit bonus challenge completion
      return { completion, pointsAwarded };
    }),

  // Mega tournament leaderboard
  getMegaLeaderboard: publicProcedure
    .input(z.object({
      megaTournamentId: z.string(),
      includeSubTournaments: z.boolean().default(true)
    }))
    .query(async ({ input }) => {
      // Get comprehensive mega tournament standings
      return { 
        overall: MegaTournamentScore[],
        bySubTournament: { [id]: Standings },
        bonusChallenges: CompletedChallenges[]
      };
    }),

  // Cross-tournament analytics
  getCrossTournamentStats: publicProcedure
    .input(z.object({
      megaTournamentId: z.string(),
      teamId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get statistics across all sub-tournaments
      return { 
        performance,
        trends,
        strengths,
        weaknesses
      };
    })
});
```

### 4. Team Router (`team.ts`)
```typescript
export const teamRouter = router({
  // Team creation and joining
  create: protectedProcedure
    .input(z.object({
      tournamentSlug: z.string(),
      name: z.string().min(2).max(50),
      motto: z.string().max(100).optional(),
      colorPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
      colorSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      flagCode: z.string().length(2).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Create team and set creator as captain
      return { team, joinCode };
    }),

  join: protectedProcedure
    .input(z.object({
      joinCode: z.string().length(8)
    }))
    .mutation(async ({ input, ctx }) => {
      // Join team with code
      return { team, role };
    }),

  leave: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Leave team
      return { success: true };
    }),

  // Team management
  update: captainProcedure
    .input(z.object({
      teamId: z.string(),
      updates: TeamUpdateSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Update team details
      return { team };
    }),

  transferCaptain: captainProcedure
    .input(z.object({
      teamId: z.string(),
      newCaptainId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Transfer captain role
      return { team };
    }),

  invitePlayer: captainProcedure
    .input(z.object({
      teamId: z.string(),
      email: z.string().email()
    }))
    .mutation(async ({ input, ctx }) => {
      // Send team invitation
      return { invitation };
    }),

  removePlayer: captainProcedure
    .input(z.object({
      teamId: z.string(),
      playerId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Remove player from team
      return { team };
    }),

  // Team queries
  get: publicProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .query(async ({ input }) => {
      // Get team with full details
      return { team, players, stats };
    }),

  getMyTeams: protectedProcedure
    .query(async ({ ctx }) => {
      // Get user's teams
      return { teams };
    }),

  getRoster: publicProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .query(async ({ input }) => {
      // Get team roster with player details
      return { players, captain, substitutes };
    }),

  // Team performance
  getStats: publicProcedure
    .input(z.object({
      teamId: z.string(),
      tournamentId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get team statistics
      return { stats, records, achievements };
    }),

  getMatchHistory: publicProcedure
    .input(z.object({
      teamId: z.string(),
      limit: z.number().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get team's match history
      return { matches, nextCursor };
    })
});
```

### 5. Match Router (`match.ts`)
```typescript
export const matchRouter = router({
  // Match queries
  get: publicProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .query(async ({ input }) => {
      // Get match details
      return { match, canEdit };
    }),

  getByTournament: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      round: z.number().optional(),
      status: MatchStatusSchema.optional()
    }))
    .query(async ({ input }) => {
      // Get tournament matches
      return { matches };
    }),

  getUpcoming: publicProcedure
    .input(z.object({
      tournamentId: z.string().optional(),
      teamId: z.string().optional(),
      limit: z.number().default(10)
    }))
    .query(async ({ input }) => {
      // Get upcoming matches
      return { matches };
    }),

  // Match operations
  start: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      actualStartTime: z.string().datetime().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Start match
      return { match };
    }),

  pause: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Pause match
      return { match, pauseDuration };
    }),

  resume: refereeProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Resume match
      return { match };
    }),

  end: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      endTime: z.string().datetime().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // End match
      return { match };
    }),

  // Match updates
  updateScore: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      scores: z.object({
        teamA: z.number(),
        teamB: z.number()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      // Update live score
      return { match };
    }),

  recordIncident: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      incident: IncidentSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Record match incident
      return { incident };
    }),

  // Station management
  assignStation: organizerProcedure
    .input(z.object({
      matchId: z.string(),
      stationId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Assign match to station
      return { match };
    }),

  scheduleMatch: organizerProcedure
    .input(z.object({
      matchId: z.string(),
      scheduledTime: z.string().datetime()
    }))
    .mutation(async ({ input, ctx }) => {
      // Schedule or reschedule match
      return { match };
    })
});
```

### 6. Scoring Router (`scoring.ts`)
```typescript
export const scoringRouter = router({
  // Score submission
  submitScore: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      scores: z.object({
        teamA: z.number().min(0),
        teamB: z.number().min(0)
      }),
      winner: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Submit match score
      return { submission, requiresConfirmation };
    }),

  confirmScore: protectedProcedure
    .input(z.object({
      submissionId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Confirm score submission
      return { confirmed, matchUpdated };
    }),

  disputeScore: protectedProcedure
    .input(z.object({
      submissionId: z.string(),
      reason: z.string(),
      evidence: z.array(z.string()).optional() // Media IDs
    }))
    .mutation(async ({ input, ctx }) => {
      // Dispute score submission
      return { dispute, notifiedParties };
    }),

  resolveDispute: refereeProcedure
    .input(z.object({
      disputeId: z.string(),
      resolution: z.enum(['accept_original', 'accept_dispute', 'new_score']),
      finalScore: z.object({
        teamA: z.number(),
        teamB: z.number()
      }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Resolve score dispute
      return { resolution, matchUpdated };
    }),

  // Score timeline
  addScoreEvent: refereeProcedure
    .input(z.object({
      matchId: z.string(),
      event: ScoreEventSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Add score event to timeline
      return { event, currentScore };
    }),

  getScoreTimeline: publicProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .query(async ({ input }) => {
      // Get score timeline
      return { timeline, finalScore };
    }),

  // Bulk scoring (for tournaments with many simultaneous matches)
  submitBulkScores: organizerProcedure
    .input(z.array(z.object({
      matchId: z.string(),
      scores: z.object({
        teamA: z.number(),
        teamB: z.number()
      }),
      winner: z.string()
    })))
    .mutation(async ({ input, ctx }) => {
      // Submit multiple scores at once
      return { processed, failed };
    })
});
```

### 7. Leaderboard Router (`leaderboard.ts`)
```typescript
export const leaderboardRouter = router({
  // Tournament leaderboards
  getTournamentLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      format: z.enum(['standings', 'bracket', 'points']).default('standings')
    }))
    .query(async ({ input }) => {
      // Get tournament leaderboard
      return { 
        standings,
        lastUpdated,
        isLive,
        nextUpdate
      };
    }),

  getPoolStandings: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      poolId: z.string()
    }))
    .query(async ({ input }) => {
      // Get pool/group standings
      return { standings, advancingTeams };
    }),

  // Game-specific leaderboards
  getGameLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      gameId: z.string()
    }))
    .query(async ({ input }) => {
      // Get game-specific stats
      return { 
        topScorers,
        bestAccuracy,
        longestStreak,
        fastestWin
      };
    }),

  // Historical leaderboards
  getAllTimeLeaderboard: publicProcedure
    .input(z.object({
      metric: z.enum(['wins', 'championships', 'points', 'games_played']),
      gameId: z.string().optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input }) => {
      // Get all-time leaderboard
      return { leaderboard };
    }),

  // Player rankings
  getPlayerRankings: publicProcedure
    .input(z.object({
      tournamentId: z.string().optional(),
      gameId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get individual player rankings
      return { rankings };
    }),

  // Live updates
  subscribeToLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .subscription(async ({ input }) => {
      // WebSocket subscription for live updates
      return observable<LeaderboardUpdate>((observer) => {
        // Subscribe to leaderboard changes
      });
    })
});
```

### 8. Media Router (`media.ts`)
```typescript
export const mediaRouter = router({
  // Media upload
  getUploadUrl: protectedProcedure
    .input(z.object({
      matchId: z.string(),
      mediaType: z.enum(['photo', 'video']),
      fileName: z.string(),
      fileSize: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      // Get presigned upload URL
      return { 
        uploadUrl,
        mediaId,
        maxSize,
        allowedFormats
      };
    }),

  completeUpload: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Complete upload and trigger processing
      return { media, processingStatus };
    }),

  // Media queries
  getByMatch: publicProcedure
    .input(z.object({
      matchId: z.string(),
      mediaType: z.enum(['all', 'photo', 'video']).default('all'),
      limit: z.number().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get match media
      return { media, nextCursor };
    }),

  getByTournament: publicProcedure
    .input(z.object({
      tournamentId: z.string(),
      featured: z.boolean().optional(),
      limit: z.number().default(20),
      cursor: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get tournament media
      return { media, nextCursor };
    }),

  // Media interactions
  likeMedia: protectedProcedure
    .input(z.object({
      mediaId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Like/unlike media
      return { liked, likeCount };
    }),

  reportMedia: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
      reason: z.enum(['inappropriate', 'copyright', 'spam', 'other']),
      details: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Report media for moderation
      return { reportId };
    }),

  // Media moderation
  moderateMedia: adminProcedure
    .input(z.object({
      mediaId: z.string(),
      action: z.enum(['approve', 'flag', 'remove']),
      reason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Moderate media
      return { moderated };
    })
});
```

### 9. Achievement Router (`achievement.ts`)
```typescript
export const achievementRouter = router({
  // Achievement definitions
  listAvailable: publicProcedure
    .input(z.object({
      tournamentId: z.string().optional(),
      category: z.enum(['performance', 'special', 'milestone', 'social']).optional()
    }))
    .query(async ({ input }) => {
      // List available achievements
      return { achievements };
    }),

  // Achievement queries
  getByTeam: publicProcedure
    .input(z.object({
      teamId: z.string(),
      tournamentId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get team achievements
      return { achievements, totalPoints };
    }),

  getByPlayer: publicProcedure
    .input(z.object({
      playerId: z.string(),
      tournamentId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get player achievements
      return { achievements, totalPoints, rareCount };
    }),

  // Achievement tracking
  checkEligibility: protectedProcedure
    .input(z.object({
      entityId: z.string(), // team or player ID
      entityType: z.enum(['team', 'player'])
    }))
    .query(async ({ input, ctx }) => {
      // Check what achievements can be earned
      return { eligible, progress };
    }),

  // Manual achievement grants (for special achievements)
  grantAchievement: organizerProcedure
    .input(z.object({
      achievementType: z.string(),
      entityId: z.string(),
      entityType: z.enum(['team', 'player']),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Manually grant achievement
      return { achievement };
    })
});
```

### 10. Real-time Router (`realtime.ts`)
```typescript
export const realtimeRouter = router({
  // Tournament subscriptions
  subscribeTournament: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .subscription(async ({ input }) => {
      return observable<TournamentEvent>((observer) => {
        // Subscribe to all tournament events
      });
    }),

  // Match subscriptions
  subscribeMatch: publicProcedure
    .input(z.object({
      matchId: z.string()
    }))
    .subscription(async ({ input }) => {
      return observable<MatchEvent>((observer) => {
        // Subscribe to match updates
      });
    }),

  // Leaderboard subscriptions
  subscribeLeaderboard: publicProcedure
    .input(z.object({
      tournamentId: z.string()
    }))
    .subscription(async ({ input }) => {
      return observable<LeaderboardUpdate>((observer) => {
        // Subscribe to leaderboard changes
      });
    }),

  // Team subscriptions
  subscribeTeam: protectedProcedure
    .input(z.object({
      teamId: z.string()
    }))
    .subscription(async ({ input, ctx }) => {
      return observable<TeamEvent>((observer) => {
        // Subscribe to team updates
      });
    }),

  // Notification subscriptions
  subscribeNotifications: protectedProcedure
    .subscription(async ({ ctx }) => {
      return observable<Notification>((observer) => {
        // Subscribe to user notifications
      });
    })
});
```

### 11. Analytics Router (`analytics.ts`)
```typescript
export const analyticsRouter = router({
  // Tournament analytics
  getTournamentAnalytics: organizerProcedure
    .input(z.object({
      tournamentId: z.string(),
      metrics: z.array(z.enum([
        'participation',
        'completion_rate',
        'average_match_duration',
        'peak_concurrent_viewers',
        'media_engagement'
      ]))
    }))
    .query(async ({ input, ctx }) => {
      // Get tournament analytics
      return { analytics };
    }),

  // Player analytics
  getPlayerAnalytics: publicProcedure
    .input(z.object({
      playerId: z.string(),
      dateRange: DateRangeSchema.optional()
    }))
    .query(async ({ input }) => {
      // Get player performance analytics
      return { 
        performance,
        trends,
        comparisons,
        predictions
      };
    }),

  // Game analytics
  getGameAnalytics: publicProcedure
    .input(z.object({
      gameId: z.string(),
      tournamentId: z.string().optional()
    }))
    .query(async ({ input }) => {
      // Get game-specific analytics
      return { 
        popularity,
        averageScores,
        competitiveness,
        upsetRate
      };
    }),

  // Export data
  exportAnalytics: organizerProcedure
    .input(z.object({
      tournamentId: z.string(),
      format: z.enum(['csv', 'json', 'pdf']),
      sections: z.array(z.string())
    }))
    .mutation(async ({ input, ctx }) => {
      // Export analytics data
      return { downloadUrl, expiresAt };
    })
});
```

### 12. Admin Router (`admin.ts`)
```typescript
export const adminRouter = router({
  // User management
  listUsers: adminProcedure
    .input(z.object({
      filter: z.object({
        role: z.string().optional(),
        status: z.string().optional()
      }).optional(),
      limit: z.number().default(50),
      cursor: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      // List users with filters
      return { users, nextCursor };
    }),

  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      roles: z.array(z.string())
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user roles
      return { user };
    }),

  // Tournament management
  flagTournament: adminProcedure
    .input(z.object({
      tournamentId: z.string(),
      reason: z.string(),
      action: z.enum(['warn', 'suspend', 'delete'])
    }))
    .mutation(async ({ input, ctx }) => {
      // Flag tournament for issues
      return { flagged };
    }),

  // System monitoring
  getSystemHealth: adminProcedure
    .query(async ({ ctx }) => {
      // Get system health metrics
      return { 
        database,
        cache,
        queues,
        services
      };
    }),

  // Audit logs
  getAuditLogs: adminProcedure
    .input(z.object({
      entity: z.string().optional(),
      action: z.string().optional(),
      dateRange: DateRangeSchema,
      limit: z.number().default(100)
    }))
    .query(async ({ input, ctx }) => {
      // Get audit logs
      return { logs };
    })
});
```

## Middleware Stack

### 1. Authentication Middleware
```typescript
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  const user = await verifyToken(token);
  
  return next({
    ctx: {
      ...ctx,
      user,
      permissions: await getUserPermissions(user.id)
    }
  });
});
```

### 2. Rate Limiting Middleware
```typescript
export const rateLimitMiddleware = t.middleware(async ({ ctx, path, next }) => {
  const key = `${ctx.user?.id || ctx.ip}:${path}`;
  const limit = getRateLimitForPath(path);
  
  const allowed = await checkRateLimit(key, limit);
  
  if (!allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded'
    });
  }
  
  return next();
});
```

### 3. Logging Middleware
```typescript
export const loggingMiddleware = t.middleware(async ({ ctx, path, input, next }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    
    await logRequest({
      path,
      input,
      userId: ctx.user?.id,
      duration: Date.now() - start,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    await logRequest({
      path,
      input,
      userId: ctx.user?.id,
      duration: Date.now() - start,
      status: 'error',
      error: error.message
    });
    
    throw error;
  }
});
```

### 4. Validation Middleware
```typescript
export const validationMiddleware = t.middleware(async ({ ctx, rawInput, next }) => {
  // Additional validation beyond Zod schemas
  // E.g., check tournament capacity, team size limits, etc.
  
  return next();
});
```

## Error Handling

### Standard Error Codes
```typescript
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Business logic errors
  TOURNAMENT_FULL = 'TOURNAMENT_FULL',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  MATCH_IN_PROGRESS = 'MATCH_IN_PROGRESS',
  INSUFFICIENT_TEAMS = 'INSUFFICIENT_TEAMS',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
  requestId: string;
}
```

## Performance Optimizations

### 1. Query Batching
- Batch multiple related queries into single database calls
- Use DataLoader pattern for N+1 query prevention

### 2. Response Caching
- Cache frequently accessed data (tournaments, leaderboards)
- Implement cache invalidation on updates
- Use Redis for distributed caching

### 3. Optimistic Updates
- Return predicted results immediately
- Process in background
- Rollback on failure

### 4. Pagination
- Cursor-based pagination for all list endpoints
- Configurable page sizes with limits
- Include total count optionally

### 5. Field Selection
- Allow clients to specify required fields
- Reduce payload size
- Optimize database queries

## Security Considerations

### 1. Input Validation
- Strict Zod schemas for all inputs
- Sanitize user-generated content
- Validate file uploads

### 2. Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Tournament-specific roles

### 3. Rate Limiting
- Per-user rate limits
- Endpoint-specific limits
- DDoS protection

### 4. Data Privacy
- PII encryption at rest
- Audit logging
- GDPR compliance

### 5. API Security
- CORS configuration
- API key management
- Request signing for sensitive operations

## Testing Strategy

### 1. Unit Tests
- Test individual procedures
- Mock external dependencies
- Cover edge cases

### 2. Integration Tests
- Test complete flows
- Database interactions
- Real external services

### 3. E2E Tests
- Test from client perspective
- Critical user journeys
- Performance benchmarks

### 4. Load Tests
- Concurrent user simulations
- Tournament bracket generation
- Real-time subscriptions

## Deployment Considerations

### 1. Environment Configuration
- Development, staging, production
- Feature flags
- Environment-specific limits

### 2. Monitoring
- APM integration
- Error tracking
- Performance metrics

### 3. Scaling
- Horizontal scaling for API servers
- Database read replicas
- WebSocket server clustering

### 4. Backup & Recovery
- Regular database backups
- Point-in-time recovery
- Disaster recovery plan