// Predefined voting categories
export const VOTE_CATEGORIES = {
    mvp: {
        id: 'mvp',
        name: 'Most Valuable Player',
        description: 'The player who made the biggest impact',
        type: 'performance',
        emoji: '🏆',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 1
    },
    best_sport: {
        id: 'best_sport',
        name: 'Best Sport',
        description: 'The most sportsmanlike player',
        type: 'spirit',
        emoji: '🤝',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 2
    },
    best_outfit: {
        id: 'best_outfit',
        name: 'Best Outfit/Costume',
        description: 'Most creative team attire',
        type: 'fun',
        emoji: '👕',
        votingPeriod: {
            startTime: 'tournament_start',
            endTime: 'tournament_end'
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'all_teams',
            excludeTeammates: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 3
    },
    worst_chugger: {
        id: 'worst_chugger',
        name: 'Worst Chugger',
        description: 'The slowest chugging performance (fun award)',
        type: 'fun',
        emoji: '🐌',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: false // People can vote themselves
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 4
    },
    party_animal: {
        id: 'party_animal',
        name: 'Party Animal',
        description: 'Best energy and enthusiasm',
        type: 'spirit',
        emoji: '🎉',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 5
    },
    clutch_player: {
        id: 'clutch_player',
        name: 'Clutch Player',
        description: 'Best performance under pressure',
        type: 'performance',
        emoji: '⚡',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 6
    },
    best_team_spirit: {
        id: 'best_team_spirit',
        name: 'Best Team Spirit',
        description: 'Most supportive and enthusiastic team',
        type: 'team',
        emoji: '📣',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'all_teams',
            excludeTeammates: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 7
    },
    trash_talk_champion: {
        id: 'trash_talk_champion',
        name: 'Trash Talk Champion',
        description: 'Best friendly banter',
        type: 'fun',
        emoji: '💬',
        votingPeriod: {
            startTime: 'tournament_end',
            endTime: 'award_ceremony',
            duration: 30
        },
        eligibleVoters: { type: 'all_participants' },
        eligibleNominees: {
            type: 'participating_players',
            excludeSelf: true
        },
        maxVotesPerVoter: 1,
        isActive: true,
        sortOrder: 8
    }
};
// Voting System Manager
export class VotingSystem {
    constructor(db) {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: db
        });
    }
    /**
     * Start voting for a tournament
     */
    async startVoting(tournamentId, categories) {
        const activeCategories = categories || Object.keys(VOTE_CATEGORIES);
        const session = {
            tournamentId,
            activeCategories,
            votingStatus: {},
            startedAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };
        // Initialize status for each category
        for (const categoryId of activeCategories) {
            const category = VOTE_CATEGORIES[categoryId];
            if (category) {
                session.votingStatus[categoryId] = {
                    categoryId,
                    totalVotes: 0,
                    eligibleVoters: await this.getEligibleVoterCount(tournamentId, category),
                    isActive: true,
                    endsAt: session.endsAt,
                    topCandidates: []
                };
            }
        }
        await this.saveVotingSession(session);
        return session;
    }
    /**
     * Submit a vote
     */
    async submitVote(tournamentId, categoryId, voterId, nomineeId, nomineeType) {
        const category = VOTE_CATEGORIES[categoryId];
        if (!category) {
            throw new Error('Invalid vote category');
        }
        // Validate voter eligibility
        const isEligible = await this.isVoterEligible(tournamentId, categoryId, voterId);
        if (!isEligible) {
            throw new Error('Voter not eligible for this category');
        }
        // Check if voter already voted
        const existingVote = await this.getExistingVote(tournamentId, categoryId, voterId);
        if (existingVote) {
            throw new Error('Voter has already voted in this category');
        }
        // Validate nominee
        const isNomineeValid = await this.isNomineeEligible(tournamentId, categoryId, nomineeId, nomineeType);
        if (!isNomineeValid) {
            throw new Error('Nominee not eligible for this category');
        }
        // Create and save vote
        const vote = {
            _type: 'vote',
            id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tournamentId,
            categoryId,
            voterId,
            nomineeId,
            nomineeType,
            createdAt: new Date().toISOString()
        };
        await this.saveVote(vote);
        // Update real-time status
        await this.updateVotingStatus(tournamentId, categoryId);
        return {
            success: true,
            voteId: vote.id,
            currentStatus: await this.getCategoryStatus(tournamentId, categoryId)
        };
    }
    /**
     * Get voting results for a tournament
     */
    async getVotingResults(tournamentId) {
        const votes = await this.getVotesByTournament(tournamentId);
        const categories = await this.getActiveCategoriesForTournament(tournamentId);
        const categoryResults = [];
        const nomineeVotes = new Map();
        // Process votes by category
        for (const categoryId of categories) {
            const categoryVotes = votes.filter(v => v.categoryId === categoryId);
            const voteCount = new Map();
            // Count votes for each nominee
            categoryVotes.forEach(vote => {
                const current = voteCount.get(vote.nomineeId) || 0;
                voteCount.set(vote.nomineeId, current + 1);
                // Track for top nominees
                const nominee = nomineeVotes.get(vote.nomineeId) || { votes: 0, categories: new Set() };
                nominee.votes++;
                nominee.categories.add(categoryId);
                nomineeVotes.set(vote.nomineeId, nominee);
            });
            // Find winner
            if (voteCount.size > 0) {
                const sortedCandidates = Array.from(voteCount.entries())
                    .sort((a, b) => b[1] - a[1]);
                const [winnerId, winnerVotes] = sortedCandidates[0];
                const totalVotes = categoryVotes.length;
                const isTie = sortedCandidates.length > 1 && sortedCandidates[1][1] === winnerVotes;
                const result = {
                    categoryId,
                    winnerId,
                    winnerType: categoryVotes.find(v => v.nomineeId === winnerId)?.nomineeType || 'player',
                    voteCount: winnerVotes,
                    totalVotes,
                    percentage: Math.round((winnerVotes / totalVotes) * 100),
                    isTie,
                    tiedCandidates: isTie ? sortedCandidates
                        .filter(([_, votes]) => votes === winnerVotes)
                        .map(([id, _]) => id) : undefined
                };
                if (sortedCandidates.length > 1) {
                    result.runnerUpId = sortedCandidates[1][0];
                    result.runnerUpVotes = sortedCandidates[1][1];
                }
                categoryResults.push(result);
            }
        }
        // Calculate statistics
        const totalVoters = new Set(votes.map(v => v.voterId)).size;
        const totalVotes = votes.length;
        const eligibleVoters = await this.getTotalEligibleVoters(tournamentId);
        return {
            tournamentId,
            totalVoters,
            totalVotes,
            participationRate: Math.round((totalVoters / eligibleVoters) * 100),
            categoryResults,
            topNominees: await this.calculateTopNominees(nomineeVotes),
            voterEngagement: await this.calculateVoterEngagement(tournamentId, votes)
        };
    }
    /**
     * Get real-time voting status
     */
    async getVotingStatus(tournamentId) {
        return await this.getVotingSession(tournamentId);
    }
    /**
     * Close voting for a tournament
     */
    async closeVoting(tournamentId) {
        const session = await this.getVotingSession(tournamentId);
        if (session) {
            // Mark all categories as inactive
            for (const categoryId of session.activeCategories) {
                session.votingStatus[categoryId].isActive = false;
            }
            await this.saveVotingSession(session);
        }
        return await this.getVotingResults(tournamentId);
    }
    // Private helper methods
    async isVoterEligible(tournamentId, categoryId, voterId) {
        // Implementation would check voter eligibility based on category rules
        return true; // Placeholder
    }
    async isNomineeEligible(tournamentId, categoryId, nomineeId, nomineeType) {
        // Implementation would check nominee eligibility based on category rules
        return true; // Placeholder
    }
    async getExistingVote(tournamentId, categoryId, voterId) {
        // Implementation would check for existing vote
        return null; // Placeholder
    }
    async updateVotingStatus(tournamentId, categoryId) {
        // Update real-time voting status
    }
    async getCategoryStatus(tournamentId, categoryId) {
        // Get current category voting status
        return {}; // Placeholder
    }
    async getEligibleVoterCount(tournamentId, category) {
        // Calculate number of eligible voters for category
        return 0; // Placeholder
    }
    async getTotalEligibleVoters(tournamentId) {
        // Get total eligible voters for tournament
        return 0; // Placeholder
    }
    async calculateTopNominees(nomineeVotes) {
        // Calculate top nominees across all categories
        return []; // Placeholder
    }
    async calculateVoterEngagement(tournamentId, votes) {
        // Calculate voter engagement statistics
        return []; // Placeholder
    }
    // Database operations (to be implemented)
    async saveVote(vote) { }
    async saveVotingSession(session) { }
    async getVotingSession(tournamentId) { return null; }
    async getVotesByTournament(tournamentId) { return []; }
    async getActiveCategoriesForTournament(tournamentId) { return []; }
}
// Export helper functions
export function getVoteCategoriesByType(type) {
    return Object.values(VOTE_CATEGORIES).filter(cat => cat.type === type);
}
export function getActiveVoteCategories() {
    return Object.values(VOTE_CATEGORIES).filter(cat => cat.isActive);
}
export function isVotingActive(session, categoryId) {
    const status = session.votingStatus[categoryId];
    return status?.isActive && new Date() < new Date(status.endsAt);
}
