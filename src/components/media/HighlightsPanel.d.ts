interface HighlightsPanelProps {
    tournamentId: string;
    onGenerateReel?: (mediaIds: string[]) => void;
    onRefreshHighlights?: () => void;
    className?: string;
}
export declare function HighlightsPanel({ onGenerateReel, onRefreshHighlights, className }: HighlightsPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
