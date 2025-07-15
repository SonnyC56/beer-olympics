import React from 'react';
import type { VotingSession } from '../../services/voting-system';
interface VotingPanelProps {
    tournamentId?: string;
    votingSession: VotingSession | null;
    currentUserId?: string;
    onVoteSubmit: (categoryId: string, nomineeId: string, nomineeType: 'player' | 'team') => Promise<void>;
    onVotingClose?: () => void;
    className?: string;
}
declare const VotingPanel: React.FC<VotingPanelProps>;
export default VotingPanel;
