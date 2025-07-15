interface MobileScoreEntryProps {
    matchId: string;
    teams: Array<{
        id: string;
        name: string;
        color?: string;
    }>;
    gameType?: 'cups' | 'points' | 'time';
    onSubmit: (scores: Record<string, number>) => Promise<void>;
    onCancel: () => void;
}
export declare function MobileScoreEntry({ matchId, teams, gameType, onSubmit, onCancel, }: MobileScoreEntryProps): import("react/jsx-runtime").JSX.Element;
export declare function MobileScoreDisplay({ scores, teams, winner, }: {
    scores: Record<string, number>;
    teams: Array<{
        id: string;
        name: string;
        color?: string;
    }>;
    winner?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
