interface Team {
    id: string;
    name: string;
    color: string;
    avatar?: string;
}
interface Station {
    id: string;
    name: string;
    location?: string;
}
interface Game {
    id: string;
    name: string;
    icon?: string;
    estimatedDuration?: number;
}
interface UpcomingMatch {
    id: string;
    scheduledFor: Date;
    station: Station;
    game: Game;
    teams: Team[];
    round?: string;
    bracketPosition?: string;
}
interface UpcomingMatchesProps {
    matches: UpcomingMatch[];
    favoriteTeams?: string[];
    onToggleFavorite?: (teamId: string) => void;
    tickerMode?: boolean;
    compact?: boolean;
}
export declare function UpcomingMatches({ matches, favoriteTeams, onToggleFavorite, tickerMode, compact }: UpcomingMatchesProps): import("react/jsx-runtime").JSX.Element;
export {};
