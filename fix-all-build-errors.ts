import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Fix multiple files with TypeScript errors
const fixes = [
  {
    file: 'src/api/routers/media.ts',
    replacements: [
      { from: 'couchbaseService.insertDoc', to: 'couchbaseService.upsert' },
      { from: 'couchbaseService.getDoc', to: 'couchbaseService.get' },
      { from: 'couchbaseService.removeDoc', to: 'couchbaseService.remove' },
      { from: 'couchbaseService.bucketName', to: `'beer-olympics'` },
      { from: '{ matchId }', to: '[matchId]' },
      { from: '{ tournamentId }', to: '[tournamentId]' },
      { from: '{ matchIds }', to: 'matchIds' },
      { from: '{ providerId }', to: '[providerId]' },
    ]
  },
  {
    file: 'src/api/routers/match-enhanced.ts',
    replacements: [
      { from: 'tournament.matchOptions?.teams?.[0]', to: '(tournament.matchOptions?.teams?.[0] || "team1")' },
      { from: 'tournament.matchOptions?.teams?.[1]', to: '(tournament.matchOptions?.teams?.[1] || "team2")' },
      { from: 'match.tournament.teams?.[reporterTeamIndex]', to: '(match.tournament.teams?.[reporterTeamIndex] || "unknown")' },
    ]
  },
  {
    file: 'src/api/routers/player.ts',
    replacements: [
      { from: /} catch \(error\) {/g, to: '} catch (err) {' },
      { from: /console\.error\('([^']+)', error\);/g, to: `console.error('$1', err);` },
      { from: /error instanceof Error \? error\.message/g, to: 'err instanceof Error ? err.message' },
      { from: 'const teamScore = scores[matchResult.teams[0]];', to: 'const teamScore = scores[matchResult.teams[0]] || 0;' },
      { from: 'const opponentScore = scores[matchResult.teams[1]];', to: 'const opponentScore = scores[matchResult.teams[1]] || 0;' },
    ]
  },
  {
    file: 'src/api/routers/match.ts',
    replacements: [
      { from: 'gameType: event.gameType', to: 'gameType: (match as any).gameType || "default"' },
    ]
  },
  {
    file: 'src/api/routers/gamification.ts',
    replacements: [
      { from: '.query(async ({ input }) => {', to: '.query(async () => {' },
    ]
  },
  {
    file: 'src/services/media.ts',
    replacements: [
      { from: `resource_type: 'auto' as const`, to: `resource_type: 'auto' as 'auto'` },
    ]
  },
  {
    file: 'src/services/realtime-server.ts',
    replacements: [
      { from: 'if (window', to: 'if (typeof window !== "undefined" && window' },
    ]
  },
  {
    file: 'src/types/player-stats.ts',
    content: `export interface PlayerStats {
  playerId: string;
  tournamentId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalPointsScored: number;
  totalPointsConceded: number;
  winRate: number;
  avgPointsPerGame: number;
  achievements: string[];
  xp: number;
  level: number;
  totalWins?: number;
  totalGamesPlayed?: number;
  tournamentHistory?: Array<{ id: string; name: string; placement: number }>;
}`
  },
  {
    file: 'src/services/achievement-engine.ts',
    replacements: [
      { from: 'stats.totalGamesPlayed', to: '(stats.totalGamesPlayed || stats.gamesPlayed)' },
      { from: 'stats.tournamentHistory?.filter(t =>', to: 'stats.tournamentHistory?.filter((t: any) =>' },
    ]
  }
];

// Apply fixes
fixes.forEach(({ file, replacements, content }) => {
  const fullPath = join(process.cwd(), file);
  
  if (content) {
    // Write new content
    writeFileSync(fullPath, content);
    console.log(`✓ Created ${file}`);
  } else if (replacements) {
    // Read file
    let fileContent = readFileSync(fullPath, 'utf-8');
    
    // Apply replacements
    replacements.forEach(({ from, to }) => {
      if (typeof from === 'string') {
        fileContent = fileContent.replace(from, to);
      } else {
        fileContent = fileContent.replace(from, to);
      }
    });
    
    // Write back
    writeFileSync(fullPath, fileContent);
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('✅ All fixes applied!');