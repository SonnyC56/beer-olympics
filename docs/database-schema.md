# Beer Olympics Database Schema Design

## Overview
This document outlines the comprehensive Couchbase database schema for the Beer Olympics application, designed to support tournament hierarchies, real-time operations, media management, and scalability.

## Database Design Principles

1. **Document-Oriented**: Leverage Couchbase's document database strengths
2. **Denormalization**: Strategic denormalization for read performance
3. **Type Safety**: All documents include `_type` field for identification
4. **Timestamp Tracking**: All documents include created/updated timestamps
5. **Hierarchical Support**: Native support for mega-tournaments and sub-tournaments
6. **Real-time Ready**: Optimized for real-time subscriptions and updates

## Collections Structure

### 1. Primary Collections
- `tournaments` - Tournament configurations and metadata
- `teams` - Team registrations and profiles
- `players` - Individual player profiles
- `matches` - Match records and states
- `scores` - Score entries and validations
- `media` - Media uploads and references
- `achievements` - Awards and achievements

### 2. Supporting Collections
- `users` - User accounts and authentication
- `sessions` - Active user sessions
- `events` - Real-time event stream
- `analytics` - Performance and usage analytics

## Document Schemas

### Tournament Document
```json
{
  "_type": "tournament",
  "slug": "summer-2024",
  "name": "Summer Beer Olympics 2024",
  "description": "Annual summer championship",
  "date": "2024-07-15",
  "venue": {
    "name": "Olympic Park",
    "address": "123 Main St",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "ownerId": "user::john-doe",
  "organizerIds": ["user::john-doe", "user::jane-smith"],
  "isOpen": true,
  "registrationDeadline": "2024-07-10T23:59:59Z",
  
  // Tournament Configuration
  "format": "double_elimination",
  "maxTeams": 32,
  "minTeamsToStart": 8,
  "teamsPerMatch": 2,
  
  // Hierarchy Support
  "parentTournamentId": null, // null if root tournament
  "subTournamentIds": ["tournament::summer-2024-pool-a", "tournament::summer-2024-pool-b"],
  "isMegaTournament": true,
  "hierarchy": {
    "level": 0, // 0 for mega, 1 for sub, 2 for sub-sub
    "path": ["summer-2024"] // breadcrumb path
  },
  
  // Tournament Engine Integration
  "engineConfig": {
    "format": "double_elimination",
    "short": false,
    "bronzeMatch": true,
    "advancers": 2, // for group stages
    "groupSize": 4, // for group stages
    "seedingMethod": "ranking"
  },
  
  // Game Configuration
  "games": [
    {
      "id": "game::beer-pong",
      "name": "Beer Pong",
      "description": "Classic cup elimination",
      "scoringType": "points", // points, time, elimination
      "scoringConfig": {
        "winCondition": "first_to",
        "winThreshold": 10,
        "pointsPerCup": 1
      },
      "maxDuration": 1800, // 30 minutes in seconds
      "requiredEquipment": ["cups", "balls", "table"],
      "rules": ["No leaning", "Elbow rule applies"]
    },
    {
      "id": "game::flip-cup",
      "name": "Flip Cup",
      "scoringType": "time",
      "scoringConfig": {
        "winCondition": "fastest",
        "rounds": 3
      }
    }
  ],
  
  // Scoring Configuration
  "scoring": {
    "method": "placement", // placement, points, hybrid
    "placementPoints": {
      "1": 100,
      "2": 75,
      "3": 50,
      "4": 25,
      "default": 10
    },
    "tiebreakers": ["head2head", "total_points", "time"],
    "bonusChallenges": [
      {
        "id": "perfect-game",
        "name": "Perfect Game",
        "description": "Win without opponent scoring",
        "points": 20,
        "maxPerTeam": 3
      }
    ]
  },
  
  // Schedule Configuration
  "schedule": {
    "startTime": "2024-07-15T10:00:00Z",
    "estimatedEndTime": "2024-07-15T20:00:00Z",
    "roundDurations": {
      "1": 60, // Round 1: 60 minutes
      "2": 45,
      "default": 30
    },
    "breakDurations": {
      "between_rounds": 15,
      "lunch": 60
    }
  },
  
  // State Management
  "state": {
    "status": "registration", // registration, ready, in_progress, completed, cancelled
    "currentRound": 0,
    "totalRounds": 5,
    "phase": "registration", // registration, seeding, group_stage, knockout, finals
    "lastActivity": "2024-07-01T12:00:00Z"
  },
  
  // Settings and Rules
  "settings": {
    "allowLateRegistration": false,
    "requirePlayerProfiles": true,
    "minPlayersPerTeam": 2,
    "maxPlayersPerTeam": 6,
    "allowSubstitutions": true,
    "mediaUploadEnabled": true,
    "liveStreamUrl": "https://youtube.com/live/xyz",
    "prizes": [
      {
        "position": 1,
        "title": "Champions",
        "description": "Trophy + $500",
        "imageUrl": "https://..."
      }
    ]
  },
  
  // Metadata
  "createdAt": "2024-06-01T10:00:00Z",
  "updatedAt": "2024-07-01T12:00:00Z",
  "createdBy": "user::john-doe",
  "version": 2,
  
  // Analytics Snapshot
  "stats": {
    "registeredTeams": 24,
    "totalPlayers": 96,
    "completedMatches": 0,
    "mediaUploads": 0,
    "uniqueViewers": 0
  }
}
```

### Team Document
```json
{
  "_type": "team",
  "id": "team::thunderbolts-2024",
  "tournamentId": "tournament::summer-2024",
  "megaTournamentId": "tournament::summer-2024", // if part of mega tournament
  
  // Basic Info
  "name": "Thunderbolts",
  "motto": "Strike Fast, Win Big",
  "colorPrimary": "#FFD700",
  "colorSecondary": "#000000",
  "flagCode": "US",
  "logoUrl": "https://...",
  
  // Players
  "captainId": "player::mike-jones",
  "playerIds": [
    "player::mike-jones",
    "player::sarah-smith",
    "player::tom-wilson",
    "player::lisa-brown"
  ],
  "substitutes": ["player::backup-joe"],
  
  // Registration
  "registrationCode": "BOLT2024",
  "registeredAt": "2024-06-15T14:00:00Z",
  "registeredBy": "user::mike-jones",
  "paymentStatus": "paid",
  "paymentId": "stripe::xyz",
  
  // Performance
  "stats": {
    "matchesPlayed": 0,
    "wins": 0,
    "losses": 0,
    "ties": 0,
    "totalPoints": 0,
    "winStreak": 0,
    "currentStreak": 0,
    "gamesStats": {
      "beer-pong": {
        "played": 0,
        "won": 0,
        "avgScore": 0
      }
    }
  },
  
  // Rankings
  "rankings": {
    "overall": 1,
    "pool": 1,
    "previousTournament": 3
  },
  
  // Achievements
  "achievements": [
    {
      "id": "first-blood",
      "name": "First Blood",
      "earnedAt": "2024-07-15T10:30:00Z",
      "matchId": "match::r1m1"
    }
  ],
  
  // Preferences
  "preferences": {
    "notifications": true,
    "publicProfile": true,
    "showStats": true
  },
  
  // Metadata
  "createdAt": "2024-06-15T14:00:00Z",
  "updatedAt": "2024-07-15T10:30:00Z",
  "active": true
}
```

### Player Document
```json
{
  "_type": "player",
  "id": "player::mike-jones",
  "userId": "user::mike-jones", // linked user account
  
  // Profile
  "name": "Mike Jones",
  "nickname": "Thunder Mike",
  "email": "mike@example.com",
  "phone": "+1234567890",
  "avatarUrl": "https://...",
  "bio": "3-time champion, beer pong specialist",
  
  // Demographics
  "dateOfBirth": "1995-03-15",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  
  // Tournament History
  "tournaments": [
    {
      "tournamentId": "tournament::summer-2024",
      "teamId": "team::thunderbolts-2024",
      "role": "captain",
      "joinedAt": "2024-06-15T14:00:00Z"
    }
  ],
  
  // Career Stats
  "careerStats": {
    "tournamentsPlayed": 12,
    "championships": 3,
    "totalMatches": 156,
    "wins": 98,
    "winPercentage": 0.628,
    "favoriteGame": "beer-pong",
    "nemesisPlayerId": "player::rival-joe",
    "headToHead": {
      "player::rival-joe": {
        "wins": 5,
        "losses": 3
      }
    }
  },
  
  // Game-Specific Stats
  "gameStats": {
    "beer-pong": {
      "matchesPlayed": 45,
      "wins": 32,
      "perfectGames": 3,
      "avgCupsPerGame": 7.2,
      "bestStreak": 8
    },
    "flip-cup": {
      "matchesPlayed": 38,
      "wins": 20,
      "avgTime": 4.2,
      "bestTime": 3.1
    }
  },
  
  // Social
  "social": {
    "instagram": "@thundermike",
    "twitter": "@mikejonespong"
  },
  
  // Preferences
  "preferences": {
    "notifications": {
      "matchStart": true,
      "tournamentUpdates": true,
      "teamInvites": true
    },
    "privacy": {
      "showEmail": false,
      "showPhone": false,
      "showStats": true
    }
  },
  
  // Metadata
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2024-07-15T10:30:00Z",
  "lastActiveAt": "2024-07-15T10:30:00Z",
  "verified": true
}
```

### Match Document
```json
{
  "_type": "match",
  "id": "match::summer24-r2m3",
  "tournamentId": "tournament::summer-2024",
  "subTournamentId": "tournament::summer-2024-pool-a", // if in sub-tournament
  
  // Match Configuration
  "gameId": "game::beer-pong",
  "gameName": "Beer Pong",
  "round": 2,
  "matchNumber": 3,
  "bracketPosition": { "s": 1, "r": 2, "m": 3 }, // section, round, match
  "stationId": "station::table-1",
  "stationName": "Table 1",
  
  // Teams
  "teamA": {
    "id": "team::thunderbolts-2024",
    "name": "Thunderbolts",
    "seed": 3,
    "color": "#FFD700"
  },
  "teamB": {
    "id": "team::lightning-2024",
    "name": "Lightning",
    "seed": 6,
    "color": "#4169E1"
  },
  
  // Players (snapshot at match time)
  "playersA": [
    {
      "id": "player::mike-jones",
      "name": "Mike Jones",
      "position": "thrower"
    },
    {
      "id": "player::sarah-smith",
      "name": "Sarah Smith",
      "position": "catcher"
    }
  ],
  "playersB": [
    {
      "id": "player::tom-wilson",
      "name": "Tom Wilson",
      "position": "thrower"
    },
    {
      "id": "player::lisa-brown",
      "name": "Lisa Brown",
      "position": "catcher"
    }
  ],
  
  // Schedule
  "scheduledTime": "2024-07-15T14:30:00Z",
  "actualStartTime": "2024-07-15T14:32:00Z",
  "endTime": "2024-07-15T14:55:00Z",
  "duration": 1380, // seconds
  
  // State
  "status": "completed", // scheduled, ready, in_progress, completed, disputed, void
  "winner": "team::thunderbolts-2024",
  "winnerName": "Thunderbolts",
  
  // Scoring
  "score": {
    "final": {
      "a": 10,
      "b": 6
    },
    "timeline": [
      {
        "time": 120,
        "scorer": "player::mike-jones",
        "team": "a",
        "points": 1,
        "score": { "a": 1, "b": 0 }
      }
    ],
    "verified": true,
    "verifiedBy": "user::ref-jane",
    "verifiedAt": "2024-07-15T14:56:00Z"
  },
  
  // Officials
  "referee": {
    "id": "user::ref-jane",
    "name": "Jane Referee"
  },
  "scorekeeper": {
    "id": "user::score-bob",
    "name": "Bob Scorekeeper"
  },
  
  // Media
  "media": [
    {
      "id": "media::match-video-1",
      "type": "video",
      "url": "https://...",
      "thumbnail": "https://...",
      "uploadedBy": "user::fan-joe",
      "uploadedAt": "2024-07-15T15:00:00Z",
      "views": 1523
    }
  ],
  
  // Stats
  "stats": {
    "teamA": {
      "shots": 45,
      "hits": 28,
      "accuracy": 0.622,
      "streaks": [3, 5, 2],
      "timeouts": 1
    },
    "teamB": {
      "shots": 42,
      "hits": 20,
      "accuracy": 0.476,
      "streaks": [2, 3],
      "timeouts": 2
    }
  },
  
  // Incidents
  "incidents": [
    {
      "time": 600,
      "type": "timeout",
      "team": "b",
      "description": "Strategic timeout"
    },
    {
      "time": 1200,
      "type": "dispute",
      "description": "Elbow rule violation claim",
      "resolved": true,
      "ruling": "No violation"
    }
  ],
  
  // Next Match References
  "nextMatchId": "match::summer24-r3m2", // winner advances to
  "loserMatchId": null, // for double elimination
  
  // Metadata
  "createdAt": "2024-07-15T10:00:00Z",
  "updatedAt": "2024-07-15T14:56:00Z",
  "version": 3
}
```

### Score Entry Document
```json
{
  "_type": "score_entry",
  "id": "score::entry-12345",
  "matchId": "match::summer24-r2m3",
  "tournamentId": "tournament::summer-2024",
  
  // Submission Details
  "submittedBy": {
    "id": "user::captain-mike",
    "name": "Mike Jones",
    "role": "captain",
    "teamId": "team::thunderbolts-2024"
  },
  "submittedAt": "2024-07-15T14:55:30Z",
  
  // Score Data
  "score": {
    "teamA": 10,
    "teamB": 6,
    "winner": "team::thunderbolts-2024"
  },
  
  // Verification
  "status": "confirmed", // pending, confirmed, disputed, rejected
  "confirmations": [
    {
      "userId": "user::captain-tom",
      "teamId": "team::lightning-2024",
      "confirmedAt": "2024-07-15T14:56:00Z"
    },
    {
      "userId": "user::ref-jane",
      "role": "referee",
      "confirmedAt": "2024-07-15T14:56:10Z"
    }
  ],
  
  // Dispute Handling
  "dispute": null, // or dispute object if disputed
  
  // Metadata
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-07-15T14:55:30Z",
  "processedAt": "2024-07-15T14:56:15Z"
}
```

### Media Document
```json
{
  "_type": "media",
  "id": "media::upload-67890",
  "matchId": "match::summer24-r2m3",
  "tournamentId": "tournament::summer-2024",
  
  // Media Details
  "type": "video", // video, photo, stream
  "title": "Epic comeback in Beer Pong finals",
  "description": "Thunderbolts comeback from 2-8 deficit",
  
  // Storage
  "storage": {
    "provider": "cloudinary", // cloudinary, s3, youtube
    "providerId": "beerolympics/videos/match-67890",
    "url": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/.../thumb",
    "duration": 180, // seconds for video
    "fileSize": 52428800, // bytes
    "format": "mp4",
    "resolution": "1920x1080"
  },
  
  // Upload Info
  "uploadedBy": {
    "id": "user::fan-joe",
    "name": "Joe Fan",
    "teamAffiliation": "team::thunderbolts-2024"
  },
  "uploadedAt": "2024-07-15T15:00:00Z",
  "device": "iPhone 14 Pro",
  
  // Engagement
  "stats": {
    "views": 1523,
    "likes": 245,
    "shares": 32,
    "comments": 18
  },
  
  // Processing
  "processing": {
    "status": "completed", // uploading, processing, completed, failed
    "thumbnailGenerated": true,
    "autoTagged": ["beer-pong", "comeback", "finals"],
    "transcoded": true
  },
  
  // Moderation
  "moderation": {
    "status": "approved", // pending, approved, flagged, removed
    "reviewedBy": "user::admin-jane",
    "reviewedAt": "2024-07-15T15:05:00Z"
  },
  
  // Tags and Categories
  "tags": ["finals", "comeback", "beer-pong", "epic"],
  "gameId": "game::beer-pong",
  "highlight": true,
  "featured": false,
  
  // Permissions
  "visibility": "public", // public, tournament, team, private
  "downloadEnabled": true,
  
  // Metadata
  "createdAt": "2024-07-15T15:00:00Z",
  "updatedAt": "2024-07-15T15:05:00Z"
}
```

### Achievement Document
```json
{
  "_type": "achievement",
  "id": "achievement::perfect-sweep-2024",
  "earnerId": "team::thunderbolts-2024", // can be team or player
  "earnerType": "team",
  "tournamentId": "tournament::summer-2024",
  
  // Achievement Details
  "type": "perfect-sweep",
  "name": "Perfect Sweep",
  "description": "Win all pool play matches without dropping a game",
  "category": "performance", // performance, special, milestone, social
  "rarity": "epic", // common, rare, epic, legendary
  "points": 50,
  
  // Earning Context
  "earnedAt": "2024-07-15T16:00:00Z",
  "triggerMatchId": "match::summer24-pool-final",
  "evidence": {
    "matchesWon": 6,
    "gamesDropped": 0,
    "totalPoints": 60
  },
  
  // Visual
  "badge": {
    "iconUrl": "https://...",
    "animationUrl": "https://...",
    "color": "#FFD700"
  },
  
  // Notification
  "announced": true,
  "announcedAt": "2024-07-15T16:01:00Z",
  "celebrationShown": true,
  
  // Metadata
  "createdAt": "2024-07-15T16:00:00Z"
}
```

### User Document
```json
{
  "_type": "user",
  "id": "user::mike-jones",
  "email": "mike@example.com",
  "emailVerified": true,
  
  // Authentication
  "auth": {
    "provider": "google", // google, email, apple
    "providerId": "google::1234567890",
    "lastLoginAt": "2024-07-15T09:00:00Z",
    "twoFactorEnabled": false
  },
  
  // Profile
  "profile": {
    "name": "Mike Jones",
    "displayName": "Thunder Mike",
    "avatarUrl": "https://...",
    "bio": "Beer Olympics enthusiast",
    "location": "New York, NY"
  },
  
  // Roles and Permissions
  "roles": ["player", "captain", "organizer"],
  "permissions": [
    "tournament.create",
    "team.manage",
    "score.submit"
  ],
  
  // Linked Entities
  "playerId": "player::mike-jones",
  "organizerOf": ["tournament::summer-2024"],
  "captainOf": ["team::thunderbolts-2024"],
  
  // Preferences
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "America/New_York",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  },
  
  // Metadata
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2024-07-15T09:00:00Z",
  "lastActiveAt": "2024-07-15T14:30:00Z",
  "status": "active" // active, suspended, deleted
}
```

## Indexes

### Primary Indexes
```sql
-- Tournament lookups
CREATE INDEX idx_tournament_slug ON tournaments(slug);
CREATE INDEX idx_tournament_date ON tournaments(date);
CREATE INDEX idx_tournament_owner ON tournaments(ownerId);
CREATE INDEX idx_tournament_parent ON tournaments(parentTournamentId);

-- Team queries
CREATE INDEX idx_team_tournament ON teams(tournamentId);
CREATE INDEX idx_team_captain ON teams(captainId);
CREATE INDEX idx_team_players ON teams(playerIds);

-- Match scheduling
CREATE INDEX idx_match_tournament_round ON matches(tournamentId, round);
CREATE INDEX idx_match_scheduled ON matches(scheduledTime);
CREATE INDEX idx_match_status ON matches(status);
CREATE INDEX idx_match_station ON matches(stationId);

-- Score tracking
CREATE INDEX idx_score_match ON scores(matchId);
CREATE INDEX idx_score_status ON scores(status);
CREATE INDEX idx_score_submitted ON scores(submittedAt);

-- Media queries
CREATE INDEX idx_media_match ON media(matchId);
CREATE INDEX idx_media_tournament ON media(tournamentId);
CREATE INDEX idx_media_uploaded ON media(uploadedAt);
CREATE INDEX idx_media_type ON media(type);

-- Player history
CREATE INDEX idx_player_user ON players(userId);
CREATE INDEX idx_player_tournaments ON players(tournaments.tournamentId);

-- Real-time subscriptions
CREATE INDEX idx_event_tournament ON events(tournamentId);
CREATE INDEX idx_event_type ON events(type);
CREATE INDEX idx_event_timestamp ON events(timestamp);
```

### Query Views
```javascript
// Active tournaments view
function (doc, meta) {
  if (doc._type === 'tournament' && doc.isOpen) {
    emit([doc.date, doc.slug], {
      name: doc.name,
      date: doc.date,
      teams: doc.stats.registeredTeams,
      maxTeams: doc.maxTeams
    });
  }
}

// Team leaderboard view
function (doc, meta) {
  if (doc._type === 'team') {
    emit([doc.tournamentId, -doc.stats.totalPoints], {
      name: doc.name,
      wins: doc.stats.wins,
      losses: doc.stats.losses,
      points: doc.stats.totalPoints
    });
  }
}

// Upcoming matches view
function (doc, meta) {
  if (doc._type === 'match' && doc.status === 'scheduled') {
    emit([doc.tournamentId, doc.scheduledTime], {
      round: doc.round,
      teams: [doc.teamA.name, doc.teamB.name],
      station: doc.stationName
    });
  }
}
```

## Data Relationships

### Tournament Hierarchy
- Mega Tournament → Sub-Tournaments → Matches
- Teams can participate in multiple sub-tournaments
- Scores aggregate up the hierarchy

### Player Journey
1. User creates account → User document
2. User creates player profile → Player document
3. Player joins/creates team → Team document + Player.tournaments update
4. Team registers for tournament → Team document + Tournament.stats update
5. Matches scheduled → Match documents created
6. Scores submitted → Score + Match documents updated
7. Media uploaded → Media documents created
8. Achievements earned → Achievement documents created

## Performance Considerations

1. **Denormalization**: Team names, player names cached in match documents
2. **Counters**: Tournament stats cached and updated via atomic operations
3. **Pagination**: All list queries support skip/limit
4. **Caching**: Frequently accessed documents (tournaments, current matches) cached
5. **Real-time**: Event documents for WebSocket subscriptions
6. **Archival**: Completed tournaments moved to archive bucket after 1 year

## Security & Privacy

1. **Document-level security**: Each document type has specific access rules
2. **PII handling**: Personal information in separate user/player documents
3. **Audit trail**: All modifications logged with user and timestamp
4. **Data retention**: Configurable retention policies per document type
5. **GDPR compliance**: User data export and deletion capabilities

## Migration & Versioning

1. **Schema version**: Tracked in each document
2. **Migrations**: Applied via background jobs
3. **Backwards compatibility**: Old schema versions supported for read
4. **Change tracking**: Document history maintained for critical types