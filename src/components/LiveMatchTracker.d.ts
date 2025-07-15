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
    rules?: string;
}
interface Score {
    teamId: string;
    score: number;
    position: number;
}
interface Match {
    id: string;
    status: 'in_progress' | 'completed' | 'upcoming';
    startedAt?: Date;
    completedAt?: Date;
    station: Station;
    game: Game;
    teams: Team[];
    scores: Score[];
    highlights?: {
        id: string;
        type: 'photo' | 'video';
        url: string;
        timestamp: Date;
    }[];
}
interface LiveMatchTrackerProps {
    matches: Match[];
    onFocusMatch?: (stationId: string) => void;
    favoriteTeams?: string[];
    displayMode?: 'desktop' | 'mobile' | 'tv';
    focused?: boolean;
    gridView?: boolean;
    tvMode?: boolean;
}
export declare function LiveMatchTracker({ matches, onFocusMatch, favoriteTeams, displayMode, focused, gridView, tvMode }: LiveMatchTrackerProps): import("react/jsx-runtime").JSX.Element;
export {};
