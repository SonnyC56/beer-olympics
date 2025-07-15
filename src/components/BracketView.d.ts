interface Team {
    id: string;
    name: string;
    seed: number;
    color: string;
    flag?: string;
}
interface Match {
    id: string;
    round: number;
    position: number;
    team1?: Team;
    team2?: Team;
    score1?: number;
    score2?: number;
    winner?: string;
    status: 'pending' | 'in_progress' | 'completed';
    startTime?: string;
    gameType?: string;
}
interface BracketViewProps {
    tournamentName: string;
    format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage';
    matches: Match[];
    teams: Team[];
    currentRound?: number;
    onMatchClick?: (match: Match) => void;
    onRefresh?: () => void;
    compact?: boolean;
}
export default function BracketView({ tournamentName, format, matches, teams, onMatchClick, onRefresh, compact }: BracketViewProps): import("react/jsx-runtime").JSX.Element;
export {};
