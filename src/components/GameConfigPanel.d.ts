interface GameConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    duration: number;
    pointsForWin: number;
    pointsForSecond: number;
    pointsForThird: number;
    bonusPoints: BonusPoint[];
    rules: string[];
    equipment: string[];
    customSettings: Record<string, any>;
}
interface BonusPoint {
    id: string;
    name: string;
    points: number;
    description: string;
}
interface GameConfigPanelProps {
    games: string[];
    onSave: (configs: GameConfig[]) => void;
    initialConfigs?: GameConfig[];
}
export default function GameConfigPanel({ games, onSave, initialConfigs }: GameConfigPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
