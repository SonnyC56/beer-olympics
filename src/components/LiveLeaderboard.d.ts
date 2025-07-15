interface TeamStats {
    teamId: string;
    teamName: string;
    colorHex: string;
    flagCode: string;
    position: number;
    previousPosition?: number;
    totalPoints: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    pointsPerGame: number;
    streak?: {
        type: 'win' | 'loss';
        count: number;
    };
    recentForm: ('W' | 'L')[];
    gameBreakdown: {
        gameId: string;
        gameName: string;
        points: number;
        rank: number;
    }[];
}
interface LiveLeaderboardProps {
    stats: TeamStats[];
    tournamentName: string;
    onTeamClick?: (teamId: string) => void;
    updateInterval?: number;
    showAnimations?: boolean;
    compactMode?: boolean;
}
export default function LiveLeaderboard({ stats: initialStats, onTeamClick, updateInterval, showAnimations, compactMode }: LiveLeaderboardProps): import("react/jsx-runtime").JSX.Element;
export {};
