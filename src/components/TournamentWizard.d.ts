interface TournamentWizardProps {
    onComplete: (data: TournamentData) => void;
    onCancel?: () => void;
}
interface TournamentData {
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage' | 'free_for_all' | 'masters';
    maxTeams: number;
    teamSize: number;
    entryFee: number;
    prizePool: number;
    games: string[];
    customGames: string[];
    scoringMethod: 'points' | 'wins' | 'combined';
    tieBreaker: string;
    features: string[];
    theme: string;
    primaryColor: string;
    accentColor: string;
    isPublic: boolean;
    requiresApproval: boolean;
    allowLateJoin: boolean;
    streamingEnabled: boolean;
    photoSharing: boolean;
}
export default function TournamentWizard({ onComplete, onCancel }: TournamentWizardProps): import("react/jsx-runtime").JSX.Element;
export {};
