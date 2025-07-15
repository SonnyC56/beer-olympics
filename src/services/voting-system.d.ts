export interface Vote {
    _type: 'vote';
    id: string;
    tournamentId: string;
    categoryId: string;
    voterId: string;
    nomineeId: string;
    nomineeType: 'player' | 'team';
    createdAt: string;
    weight?: number;
}
export interface VoteCategory {
    id: string;
    name: string;
    description: string;
    type: VoteCategoryType;
    emoji: string;
    votingPeriod: VotingPeriod;
    eligibleVoters: VoterEligibility;
    eligibleNominees: NomineeEligibility;
    maxVotesPerVoter: number;
    isActive: boolean;
    sortOrder: number;
}
export type VoteCategoryType = 'performance' | 'spirit' | 'fun' | 'team' | 'special';
export interface VotingPeriod {
    startTime: 'tournament_start' | 'tournament_end' | 'custom';
    endTime: 'tournament_end' | 'award_ceremony' | 'custom';
    customStartTime?: string;
    customEndTime?: string;
    duration?: number;
}
export interface VoterEligibility {
    type: 'all_participants' | 'team_captains' | 'organizers' | 'spectators' | 'custom';
    customRules?: string[];
}
export interface NomineeEligibility {
    type: 'all_players' | 'all_teams' | 'participating_players' | 'winning_teams' | 'custom';
    excludeSelf?: boolean;
    excludeTeammates?: boolean;
    customRules?: string[];
}
export declare const VOTE_CATEGORIES: Record<string, VoteCategory>;
export interface VoteResult {
    categoryId: string;
    winnerId: string;
    winnerType: 'player' | 'team';
    voteCount: number;
    totalVotes: number;
    percentage: number;
    runnerUpId?: string;
    runnerUpVotes?: number;
    isTie: boolean;
    tiedCandidates?: string[];
}
export interface VotingStats {
    tournamentId: string;
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    categoryResults: VoteResult[];
    topNominees: TopNominee[];
    voterEngagement: VoterEngagement[];
}
export interface TopNominee {
    id: string;
    type: 'player' | 'team';
    name: string;
    totalVotes: number;
    categoriesWon: string[];
    nominationCount: number;
}
export interface VoterEngagement {
    voterId: string;
    categoriesVoted: number;
    totalCategories: number;
    engagementRate: number;
}
export interface VotingSession {
    tournamentId: string;
    activeCategories: string[];
    votingStatus: {
        [categoryId: string]: CategoryVotingStatus;
    };
    startedAt: string;
    endsAt: string;
}
export interface CategoryVotingStatus {
    categoryId: string;
    totalVotes: number;
    eligibleVoters: number;
    isActive: boolean;
    endsAt: string;
    topCandidates: CandidateStatus[];
}
export interface CandidateStatus {
    id: string;
    name: string;
    voteCount: number;
    percentage: number;
    isLeading: boolean;
}
export declare class VotingSystem {
    private db;
    constructor(db: any);
    /**
     * Start voting for a tournament
     */
    startVoting(tournamentId: string, categories?: string[]): Promise<VotingSession>;
    /**
     * Submit a vote
     */
    submitVote(tournamentId: string, categoryId: string, voterId: string, nomineeId: string, nomineeType: 'player' | 'team'): Promise<VoteSubmissionResult>;
    /**
     * Get voting results for a tournament
     */
    getVotingResults(tournamentId: string): Promise<VotingStats>;
    /**
     * Get real-time voting status
     */
    getVotingStatus(tournamentId: string): Promise<VotingSession | null>;
    /**
     * Close voting for a tournament
     */
    closeVoting(tournamentId: string): Promise<VotingStats>;
    private isVoterEligible;
    private isNomineeEligible;
    private getExistingVote;
    private updateVotingStatus;
    private getCategoryStatus;
    private getEligibleVoterCount;
    private getTotalEligibleVoters;
    private calculateTopNominees;
    private calculateVoterEngagement;
    private saveVote;
    private saveVotingSession;
    private getVotingSession;
    private getVotesByTournament;
    private getActiveCategoriesForTournament;
}
export interface VoteSubmissionResult {
    success: boolean;
    voteId: string;
    currentStatus: CategoryVotingStatus;
}
export declare function getVoteCategoriesByType(type: VoteCategoryType): VoteCategory[];
export declare function getActiveVoteCategories(): VoteCategory[];
export declare function isVotingActive(session: VotingSession, categoryId: string): boolean;
