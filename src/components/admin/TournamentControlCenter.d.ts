import type { Tournament } from '../../types';
interface TournamentControlCenterProps {
    tournament: Tournament;
    tournamentId: string;
    onUpdate: () => void;
}
export declare function TournamentControlCenter({ tournament, tournamentId, onUpdate }: TournamentControlCenterProps): import("react/jsx-runtime").JSX.Element;
export {};
