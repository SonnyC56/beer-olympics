interface NextMatch {
    id: string;
    opponent: string;
    game: string;
    time: Date;
    location?: string;
}
interface PlayerStats {
    wins: number;
    losses: number;
    totalGames: number;
    rank: number;
    totalPlayers: number;
    winStreak: number;
}
interface MobilePlayerDashboardProps {
    playerName: string;
    teamName: string;
    teamColor?: string;
    nextMatch?: NextMatch;
    stats: PlayerStats;
    recentMatches: Array<{
        id: string;
        opponent: string;
        game: string;
        result: 'win' | 'loss';
        score: {
            player: number;
            opponent: number;
        };
        time: Date;
    }>;
    notifications?: number;
}
export declare function MobilePlayerDashboard({ playerName, teamName, teamColor, nextMatch, stats, recentMatches, notifications, }: MobilePlayerDashboardProps): import("react/jsx-runtime").JSX.Element;
export {};
