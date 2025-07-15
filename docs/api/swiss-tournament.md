# Swiss Tournament API

The Swiss tournament format is ideal for tournaments with 20+ participants where every player continues to play throughout the tournament (no elimination).

## Overview

Swiss tournaments use a pairing system where players are matched against opponents with similar scores in each round. This ensures competitive matches throughout the tournament while allowing all players to participate in every round.

### Key Features

- No elimination - all players play all rounds
- Players matched by similar scores each round
- Automatic calculation of optimal round count based on player count
- Built-in tiebreaker systems (Buchholz, Sonneborn-Berger)
- Support for odd number of players (byes)
- Avoids repeat matchups

## Endpoints

### Get Swiss Tournament Data

```http
GET /api/tournament/swiss/{tournamentId}
```

Returns comprehensive tournament data including standings, matches, and current round.

#### Query Parameters

- `action` (optional): Specific data to retrieve
  - `standings` - Get current standings with tiebreakers
  - `pairings` - Get pairings for a specific round
  - `stats` - Get detailed player statistics
- `round` (optional): Round number for pairings (used with `action=pairings`)

#### Response

```json
{
  "tournament": {
    "_type": "tournament",
    "slug": "summer-2024",
    "name": "Summer Championship",
    "format": "swiss",
    "currentRound": 3,
    "totalRounds": 7,
    "isComplete": false
  },
  "teams": [
    {
      "id": "team1",
      "name": "Team Alpha",
      "players": ["Player 1", "Player 2"]
    }
  ],
  "matches": [
    {
      "id": "match1",
      "round": 1,
      "teamA": "team1",
      "teamB": "team2",
      "isComplete": true,
      "winner": "team1",
      "finalScore": { "a": 21, "b": 15 }
    }
  ],
  "standings": [
    {
      "teamId": "team1",
      "position": 1,
      "wins": 3,
      "losses": 0,
      "draws": 0,
      "points": 3,
      "buchholz": 6.5,
      "sonnebornBerger": 3
    }
  ],
  "currentRound": 3,
  "isComplete": false
}
```

### Generate Next Round Pairings

```http
POST /api/tournament/swiss/{tournamentId}
```

Generates pairings for the next round based on current standings.

#### Request Body

```json
{
  "action": "generate-pairings"
}
```

#### Response

```json
{
  "success": true,
  "round": 4,
  "pairings": [
    {
      "player1": "team1",
      "player2": "team3",
      "round": 4
    },
    {
      "player1": "team2",
      "player2": "team4",
      "round": 4
    }
  ],
  "matches": [
    {
      "id": "match123",
      "round": 4,
      "team1Id": "team1",
      "team2Id": "team3",
      "stationId": "station1",
      "status": "upcoming"
    }
  ],
  "standings": [...]
}
```

#### Error Responses

- `400` - Current round has incomplete matches
- `400` - Tournament is already complete
- `404` - Tournament not found

### Update Match Result

```http
PUT /api/tournament/swiss/{tournamentId}
```

Updates a match result and recalculates standings with tiebreakers.

#### Request Body

```json
{
  "matchId": "match123",
  "winner": "team1",
  "scores": {
    "a": 21,
    "b": 15
  }
}
```

For a draw, set `winner` to `null`.

#### Response

```json
{
  "success": true,
  "match": {
    "id": "match123",
    "isComplete": true,
    "winner": "team1"
  },
  "standings": [...],
  "roundComplete": true,
  "tournamentComplete": false
}
```

## Swiss Tournament Configuration

When creating a Swiss tournament:

```json
{
  "format": "swiss",
  "maxTeams": 32,
  "settings": {
    "maxRounds": 7,  // Optional, auto-calculated if not specified
    "tiebreakers": ["buchholz", "sonneborn_berger", "head_to_head"]
  }
}
```

### Automatic Round Calculation

If `maxRounds` is not specified, the system automatically calculates:

- 8 or fewer players: 3 rounds
- 9-16 players: 4 rounds
- 17-32 players: 5 rounds
- 33-64 players: 6 rounds
- 65+ players: 7 rounds

## Tiebreaker Systems

### Buchholz Score

Sum of all opponents' scores. A player who has faced stronger opponents (with more points) will have a higher Buchholz score.

### Sonneborn-Berger Score

Sum of defeated opponents' scores plus half of drawn opponents' scores. Rewards victories against stronger opponents.

### Head-to-Head

Direct comparison between tied players if they have played each other.

## Handling Byes

When there's an odd number of players:

- The lowest-ranked player without a bye receives one
- Bye counts as a win (1 point)
- Players can only receive one bye per tournament
- Byes are automatically assigned during pairing generation

## Example Integration

```typescript
// Generate next round
const response = await fetch(`/api/tournament/swiss/${tournamentId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'generate-pairings' })
});

const { pairings, matches } = await response.json();

// Update match result
const updateResponse = await fetch(`/api/tournament/swiss/${tournamentId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    matchId: 'match123',
    winner: 'team1',
    scores: { a: 21, b: 15 }
  })
});

const { standings, tournamentComplete } = await updateResponse.json();
```

## Best Practices

1. **Complete all matches** in a round before generating next round pairings
2. **Use station scheduling** to efficiently manage multiple concurrent matches
3. **Display tiebreaker information** in standings to help players understand rankings
4. **Plan for time** - Swiss tournaments take longer than elimination formats
5. **Consider round limits** for very large tournaments to ensure completion

## Common Scenarios

### Running a 32-Player Tournament

1. Create tournament with `format: "swiss"` and `maxTeams: 32`
2. System automatically sets 5 rounds
3. Generate Round 1 pairings (16 matches)
4. As matches complete, update results
5. When all Round 1 complete, generate Round 2
6. Continue through all 5 rounds
7. Final standings determine winner

### Handling Dropouts

If a player drops out:
1. Mark them as inactive
2. Their future opponents receive a bye (automatic win)
3. Their completed matches remain in calculations
4. Adjust pairings to avoid the inactive player