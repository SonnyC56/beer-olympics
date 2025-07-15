/**
 * Multi-Station Scheduling Engine
 * Core scheduling algorithms for tournament match scheduling
 */
import type { Station, SchedulingConfig, ScheduleResult, PlayerAvailability, SchedulingConstraint } from '../types/scheduling';
import type { Match } from '../types/tournament';
export declare class SchedulingEngine {
    private stations;
    private config;
    private intervalTree;
    private playerAvailability;
    private conflicts;
    private scheduleSlots;
    constructor(config: SchedulingConfig);
    /**
     * Initialize scheduling engine with stations
     */
    initializeStations(stations: Station[]): void;
    /**
     * Set player availability constraints
     */
    setPlayerAvailability(availability: PlayerAvailability[]): void;
    /**
     * Generate schedule for matches
     */
    generateSchedule(matches: Match[], constraints?: SchedulingConstraint[]): Promise<ScheduleResult>;
    /**
     * Greedy scheduling algorithm
     */
    private greedySchedule;
    /**
     * Backtracking scheduling algorithm
     */
    private backtrackingSchedule;
    /**
     * Constraint Satisfaction Problem (CSP) scheduling
     */
    private cspSchedule;
    /**
     * Genetic algorithm scheduling
     */
    private geneticSchedule;
    /**
     * Detect scheduling conflicts using interval tree
     */
    private detectConflicts;
    /**
     * Dynamic rescheduling for delays
     */
    rescheduleForDelay(delayedSlotId: string, delayMinutes: number): Promise<ScheduleResult>;
    /**
     * Helper methods
     */
    private prioritizeMatches;
    private createScheduleSlot;
    private findAvailableStation;
    private addToIntervalTree;
    private insertInterval;
    private findOverlappingSlots;
    private searchOverlapping;
    private getPlayerIdsFromMatch;
    private timesOverlap;
    private timeOverlapsWithSlot;
    private satisfiesConstraints;
    private checkConstraint;
    private checkRestTimeConflicts;
    private generateTimeSlots;
    private isValidSlot;
    private removeFromIntervalTree;
    private calculateResult;
    private calculateAverageWaitTime;
    private calculateMaxWaitTime;
    private calculateScheduleScore;
    private calculateScoreBreakdown;
    private checkBeforeConstraint;
    private checkAfterConstraint;
    private checkSameTimeConstraint;
    private checkDifferentTimeConstraint;
    private checkSameStationConstraint;
    private checkDifferentStationConstraint;
    private checkTimeRangeConstraint;
    private scoreMinimizeTotalTime;
    private scoreMaximizeStationUsage;
    private scoreMinimizePlayerWait;
    private scoreBalanceStationLoad;
    private scoreMinimizeConflicts;
    private calculateStationUtilization;
    private initializeDomains;
    private applyArcConsistency;
    private reviseArc;
    private cspSearch;
    private initializePopulation;
    private generateRandomSchedule;
    private evaluateFitness;
    private countConflictsInSchedule;
    private slotsConflict;
    private haveCommonPlayers;
    private countConstraintViolations;
    private schedulesSatisfiesConstraint;
    private tournamentSelection;
    private crossover;
    private singlePointCrossover;
    private mutate;
    private mutateIndividual;
    private selectBest;
}
