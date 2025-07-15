import type { Tournament } from '../../types';
interface HostToolsProps {
    tournamentId: string;
    tournament: Tournament;
    onUpdate: () => void;
}
export declare function HostTools({ onUpdate }: HostToolsProps): import("react/jsx-runtime").JSX.Element;
export {};
