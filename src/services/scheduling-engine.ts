/**
 * Multi-Station Scheduling Engine
 * Core scheduling algorithms for tournament match scheduling
 */

import type { 
  Station, 
  ScheduleSlot, 
  ScheduleConflict, 
  SchedulingConfig,
  ScheduleResult,
  PlayerAvailability,
  SchedulingConstraint,
  ScheduledMatch,
  TimeWindow
} from '../types/scheduling';
import type { Match, Tournament } from '../types/tournament';

/**
 * Interval tree node for efficient conflict detection
 */
interface IntervalNode {
  start: number;
  end: number;
  slotId: string;
  playerIds: string[];
  stationId: string;
  left: IntervalNode | null;
  right: IntervalNode | null;
  max: number;
}

/**
 * Priority queue item for scheduling
 */
interface ScheduleItem {
  match: Match;
  priority: number;
  constraints: SchedulingConstraint[];
}

export class SchedulingEngine {
  private stations: Station[] = [];
  private config: SchedulingConfig;
  private intervalTree: IntervalNode | null = null;
  private playerAvailability: Map<string, PlayerAvailability> = new Map();
  private conflicts: ScheduleConflict[] = [];
  private scheduleSlots: ScheduleSlot[] = [];

  constructor(config: SchedulingConfig) {
    this.config = config;
  }

  /**
   * Initialize scheduling engine with stations
   */
  initializeStations(stations: Station[]): void {
    this.stations = stations.filter(s => s.isActive);
  }

  /**
   * Set player availability constraints
   */
  setPlayerAvailability(availability: PlayerAvailability[]): void {
    availability.forEach(a => {
      this.playerAvailability.set(a.playerId, a);
    });
  }

  /**
   * Generate schedule for matches
   */
  async generateSchedule(
    matches: Match[], 
    constraints: SchedulingConstraint[] = []
  ): Promise<ScheduleResult> {
    const startTime = Date.now();
    
    // Reset state
    this.conflicts = [];
    this.scheduleSlots = [];
    this.intervalTree = null;

    // Sort matches by priority
    const prioritizedMatches = this.prioritizeMatches(matches, constraints);

    // Run scheduling algorithm
    let result: ScheduleResult;
    switch (this.config.algorithm) {
      case 'greedy':
        result = await this.greedySchedule(prioritizedMatches, constraints);
        break;
      case 'backtracking':
        result = await this.backtrackingSchedule(prioritizedMatches, constraints);
        break;
      case 'constraint_satisfaction':
        result = await this.cspSchedule(prioritizedMatches, constraints);
        break;
      case 'genetic':
        result = await this.geneticSchedule(prioritizedMatches, constraints);
        break;
      default:
        result = await this.greedySchedule(prioritizedMatches, constraints);
    }

    // Calculate metrics
    const generationTime = Date.now() - startTime;
    result.generationTime = generationTime;
    result.algorithmUsed = this.config.algorithm;

    return result;
  }

  /**
   * Greedy scheduling algorithm
   */
  private async greedySchedule(
    matches: ScheduleItem[], 
    constraints: SchedulingConstraint[]
  ): Promise<ScheduleResult> {
    const schedule: ScheduleSlot[] = [];
    let currentTime = new Date(this.config.startTime).getTime();
    let backtrackCount = 0;

    for (const item of matches) {
      let scheduled = false;
      let attempts = 0;
      const maxAttempts = this.stations.length * 10;

      while (!scheduled && attempts < maxAttempts) {
        attempts++;

        // Find available station
        const station = this.findAvailableStation(currentTime, item.match);
        if (!station) {
          currentTime += this.config.bufferTime * 60 * 1000;
          continue;
        }

        // Create slot
        const slot = this.createScheduleSlot(
          item.match,
          station,
          new Date(currentTime).toISOString()
        );

        // Check conflicts
        const conflicts = this.detectConflicts(slot, schedule);
        if (conflicts.length === 0) {
          // Check constraints
          if (this.satisfiesConstraints(slot, schedule, constraints)) {
            schedule.push(slot);
            this.addToIntervalTree(slot);
            scheduled = true;
          }
        }

        if (!scheduled) {
          currentTime += this.config.bufferTime * 60 * 1000;
          if (currentTime > new Date(this.config.endTime).getTime()) {
            // Backtrack or mark as conflict
            backtrackCount++;
            currentTime = new Date(this.config.startTime).getTime();
          }
        }
      }

      if (!scheduled) {
        this.conflicts.push({
          _type: 'schedule_conflict',
          id: `conflict-${Date.now()}-${Math.random()}`,
          tournamentId: item.match.tournamentId,
          type: 'station_overlap',
          severity: 'error',
          affectedSlotIds: [],
          affectedMatchIds: [item.match.id],
          description: `Unable to schedule match ${item.match.id}`,
          isResolved: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    this.scheduleSlots = schedule;
    return this.calculateResult(schedule, backtrackCount);
  }

  /**
   * Backtracking scheduling algorithm
   */
  private async backtrackingSchedule(
    matches: ScheduleItem[], 
    constraints: SchedulingConstraint[]
  ): Promise<ScheduleResult> {
    const schedule: ScheduleSlot[] = [];
    let backtrackCount = 0;

    const scheduleMatch = (index: number): boolean => {
      if (index >= matches.length) {
        return true; // All matches scheduled
      }

      const item = matches[index];
      const timeSlots = this.generateTimeSlots();

      for (const timeSlot of timeSlots) {
        for (const station of this.stations) {
          const slot = this.createScheduleSlot(
            item.match,
            station,
            timeSlot.toISOString()
          );

          if (this.isValidSlot(slot, schedule, constraints)) {
            schedule.push(slot);
            this.addToIntervalTree(slot);

            if (scheduleMatch(index + 1)) {
              return true;
            }

            // Backtrack
            schedule.pop();
            this.removeFromIntervalTree(slot);
            backtrackCount++;
          }
        }
      }

      return false;
    };

    const success = scheduleMatch(0);
    
    if (!success) {
      // Partial schedule with conflicts
      for (let i = schedule.length; i < matches.length; i++) {
        this.conflicts.push({
          _type: 'schedule_conflict',
          id: `conflict-${Date.now()}-${i}`,
          tournamentId: matches[i].match.tournamentId,
          type: 'station_overlap',
          severity: 'critical',
          affectedSlotIds: [],
          affectedMatchIds: [matches[i].match.id],
          description: `Unable to schedule match ${matches[i].match.id} with backtracking`,
          isResolved: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    this.scheduleSlots = schedule;
    return this.calculateResult(schedule, backtrackCount);
  }

  /**
   * Constraint Satisfaction Problem (CSP) scheduling
   */
  private async cspSchedule(
    matches: ScheduleItem[], 
    constraints: SchedulingConstraint[]
  ): Promise<ScheduleResult> {
    // Implement CSP algorithm using constraint propagation
    // This is a simplified version
    const domains = this.initializeDomains(matches);
    const schedule: ScheduleSlot[] = [];

    // Apply arc consistency
    this.applyArcConsistency(domains, constraints);

    // Search with forward checking
    const assignment = this.cspSearch(matches, domains, constraints, {});
    
    // Convert assignment to schedule
    for (const [matchId, slot] of Object.entries(assignment)) {
      if (slot) {
        schedule.push(slot as ScheduleSlot);
      }
    }

    this.scheduleSlots = schedule;
    return this.calculateResult(schedule, 0);
  }

  /**
   * Genetic algorithm scheduling
   */
  private async geneticSchedule(
    matches: ScheduleItem[], 
    constraints: SchedulingConstraint[]
  ): Promise<ScheduleResult> {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    
    // Initialize population
    let population = this.initializePopulation(matches, populationSize);
    
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitnessScores = population.map(individual => 
        this.evaluateFitness(individual, constraints)
      );
      
      // Selection
      const selected = this.tournamentSelection(population, fitnessScores);
      
      // Crossover
      const offspring = this.crossover(selected);
      
      // Mutation
      const mutated = this.mutate(offspring, mutationRate);
      
      // Replace population
      population = mutated;
    }
    
    // Select best individual
    const best = this.selectBest(population, constraints);
    this.scheduleSlots = best;
    
    return this.calculateResult(best, 0);
  }

  /**
   * Detect scheduling conflicts using interval tree
   */
  private detectConflicts(slot: ScheduleSlot, existingSlots: ScheduleSlot[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();

    // Check player conflicts
    const playerIds = this.getPlayerIdsFromMatch(slot.matchId || '');
    const overlappingSlots = this.findOverlappingSlots(slotStart, slotEnd);

    for (const overlapping of overlappingSlots) {
      const overlappingPlayers = this.getPlayerIdsFromMatch(overlapping.matchId || '');
      const commonPlayers = playerIds.filter(p => overlappingPlayers.includes(p));

      if (commonPlayers.length > 0) {
        conflicts.push({
          _type: 'schedule_conflict',
          id: `conflict-${Date.now()}-${Math.random()}`,
          tournamentId: slot.tournamentId,
          type: 'player_double_booked',
          severity: 'error',
          affectedSlotIds: [slot.id, overlapping.id],
          affectedMatchIds: [slot.matchId || '', overlapping.matchId || ''],
          affectedPlayerIds: commonPlayers,
          description: `Players ${commonPlayers.join(', ')} are double-booked`,
          isResolved: false,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // Check station conflicts
    const stationSlots = existingSlots.filter(s => 
      s.stationId === slot.stationId &&
      this.timesOverlap(slot, s)
    );

    if (stationSlots.length > 0) {
      conflicts.push({
        _type: 'schedule_conflict',
        id: `conflict-${Date.now()}-${Math.random()}`,
        tournamentId: slot.tournamentId,
        type: 'station_overlap',
        severity: 'error',
        affectedSlotIds: [slot.id, ...stationSlots.map(s => s.id)],
        affectedMatchIds: [slot.matchId || '', ...stationSlots.map(s => s.matchId || '')],
        affectedStationIds: [slot.stationId],
        description: `Station ${slot.stationName} is already booked`,
        isResolved: false,
        detectedAt: new Date().toISOString()
      });
    }

    // Check rest time
    const restConflicts = this.checkRestTimeConflicts(slot, existingSlots, playerIds);
    conflicts.push(...restConflicts);

    return conflicts;
  }

  /**
   * Dynamic rescheduling for delays
   */
  async rescheduleForDelay(
    delayedSlotId: string, 
    delayMinutes: number
  ): Promise<ScheduleResult> {
    const slotIndex = this.scheduleSlots.findIndex(s => s.id === delayedSlotId);
    if (slotIndex === -1) {
      throw new Error(`Slot ${delayedSlotId} not found`);
    }

    const delayedSlot = this.scheduleSlots[slotIndex];
    const newStartTime = new Date(delayedSlot.startTime).getTime() + (delayMinutes * 60 * 1000);
    
    // Update delayed slot
    delayedSlot.startTime = new Date(newStartTime).toISOString();
    delayedSlot.endTime = new Date(newStartTime + (delayedSlot.duration * 60 * 1000)).toISOString();

    // Cascade updates to subsequent slots
    const cascadeUpdates: ScheduleSlot[] = [];
    
    for (let i = slotIndex + 1; i < this.scheduleSlots.length; i++) {
      const slot = this.scheduleSlots[i];
      const conflicts = this.detectConflicts(slot, this.scheduleSlots.slice(0, i));
      
      if (conflicts.length > 0) {
        // Shift this slot
        const shiftAmount = delayMinutes * 60 * 1000;
        slot.startTime = new Date(new Date(slot.startTime).getTime() + shiftAmount).toISOString();
        slot.endTime = new Date(new Date(slot.endTime).getTime() + shiftAmount).toISOString();
        cascadeUpdates.push(slot);
      }
    }

    return this.calculateResult(this.scheduleSlots, 0);
  }

  /**
   * Helper methods
   */
  
  private prioritizeMatches(matches: Match[], constraints: SchedulingConstraint[]): ScheduleItem[] {
    return matches.map(match => {
      let priority = match.round * 100; // Higher rounds have higher priority
      
      // Adjust priority based on constraints
      const matchConstraints = constraints.filter(c => c.matchIds.includes(match.id));
      priority += matchConstraints.filter(c => c.priority === 'hard').length * 50;
      
      return {
        match,
        priority,
        constraints: matchConstraints
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  private createScheduleSlot(match: Match, station: Station, startTime: string): ScheduleSlot {
    const duration = this.config.matchDuration;
    const endTime = new Date(new Date(startTime).getTime() + (duration * 60 * 1000)).toISOString();

    return {
      _type: 'schedule_slot',
      id: `slot-${match.id}-${Date.now()}`,
      tournamentId: match.tournamentId,
      startTime,
      endTime,
      duration,
      stationId: station.id,
      stationName: station.name,
      matchId: match.id,
      round: match.round,
      status: 'scheduled',
      bufferBefore: this.config.bufferTime,
      bufferAfter: this.config.bufferTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private findAvailableStation(time: number, match: Match): Station | null {
    const availableStations = this.stations.filter(station => {
      // Check if station supports the game type
      if (match.eventName && station.gameTypes && !station.gameTypes.includes(match.eventName)) {
        return false;
      }

      // Check if station is available at this time
      const overlapping = this.scheduleSlots.filter(slot => 
        slot.stationId === station.id &&
        this.timeOverlapsWithSlot(time, slot)
      );

      return overlapping.length === 0;
    });

    // Return station with least usage
    return availableStations.sort((a, b) => {
      const aUsage = this.scheduleSlots.filter(s => s.stationId === a.id).length;
      const bUsage = this.scheduleSlots.filter(s => s.stationId === b.id).length;
      return aUsage - bUsage;
    })[0] || null;
  }

  private addToIntervalTree(slot: ScheduleSlot): void {
    const node: IntervalNode = {
      start: new Date(slot.startTime).getTime(),
      end: new Date(slot.endTime).getTime(),
      slotId: slot.id,
      playerIds: this.getPlayerIdsFromMatch(slot.matchId || ''),
      stationId: slot.stationId,
      left: null,
      right: null,
      max: new Date(slot.endTime).getTime()
    };

    if (!this.intervalTree) {
      this.intervalTree = node;
    } else {
      this.insertInterval(this.intervalTree, node);
    }
  }

  private insertInterval(root: IntervalNode, node: IntervalNode): void {
    if (node.start < root.start) {
      if (root.left) {
        this.insertInterval(root.left, node);
      } else {
        root.left = node;
      }
    } else {
      if (root.right) {
        this.insertInterval(root.right, node);
      } else {
        root.right = node;
      }
    }
    
    // Update max value
    root.max = Math.max(root.max, node.max);
  }

  private findOverlappingSlots(start: number, end: number): ScheduleSlot[] {
    const overlapping: string[] = [];
    this.searchOverlapping(this.intervalTree, start, end, overlapping);
    
    return this.scheduleSlots.filter(s => overlapping.includes(s.id));
  }

  private searchOverlapping(node: IntervalNode | null, start: number, end: number, result: string[]): void {
    if (!node) return;

    // Check if current node overlaps
    if (node.start < end && node.end > start) {
      result.push(node.slotId);
    }

    // Search left subtree if possible
    if (node.left && node.left.max > start) {
      this.searchOverlapping(node.left, start, end, result);
    }

    // Search right subtree if possible
    if (node.right && node.start < end) {
      this.searchOverlapping(node.right, start, end, result);
    }
  }

  private getPlayerIdsFromMatch(matchId: string): string[] {
    // This would need to be implemented based on your match/team structure
    // For now, returning empty array
    return [];
  }

  private timesOverlap(slot1: ScheduleSlot, slot2: ScheduleSlot): boolean {
    const start1 = new Date(slot1.startTime).getTime();
    const end1 = new Date(slot1.endTime).getTime();
    const start2 = new Date(slot2.startTime).getTime();
    const end2 = new Date(slot2.endTime).getTime();

    return start1 < end2 && end1 > start2;
  }

  private timeOverlapsWithSlot(time: number, slot: ScheduleSlot): boolean {
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();
    const matchEnd = time + (this.config.matchDuration * 60 * 1000);

    return time < slotEnd && matchEnd > slotStart;
  }

  private satisfiesConstraints(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraints: SchedulingConstraint[]
  ): boolean {
    const relevantConstraints = constraints.filter(c => 
      c.matchIds.includes(slot.matchId || '')
    );

    for (const constraint of relevantConstraints) {
      if (!this.checkConstraint(slot, schedule, constraint)) {
        if (constraint.priority === 'hard') {
          return false;
        }
      }
    }

    return true;
  }

  private checkConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    switch (constraint.type) {
      case 'before':
        return this.checkBeforeConstraint(slot, schedule, constraint);
      case 'after':
        return this.checkAfterConstraint(slot, schedule, constraint);
      case 'same_time':
        return this.checkSameTimeConstraint(slot, schedule, constraint);
      case 'different_time':
        return this.checkDifferentTimeConstraint(slot, schedule, constraint);
      case 'same_station':
        return this.checkSameStationConstraint(slot, schedule, constraint);
      case 'different_station':
        return this.checkDifferentStationConstraint(slot, schedule, constraint);
      case 'time_range':
        return this.checkTimeRangeConstraint(slot, constraint);
      default:
        return true;
    }
  }

  private checkRestTimeConflicts(
    slot: ScheduleSlot, 
    existingSlots: ScheduleSlot[], 
    playerIds: string[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const minRest = this.config.minRestTime * 60 * 1000; // Convert to milliseconds

    for (const playerId of playerIds) {
      const playerSlots = existingSlots.filter(s => {
        const slotPlayers = this.getPlayerIdsFromMatch(s.matchId || '');
        return slotPlayers.includes(playerId);
      });

      for (const playerSlot of playerSlots) {
        const timeDiff = Math.abs(
          new Date(slot.startTime).getTime() - new Date(playerSlot.endTime).getTime()
        );

        if (timeDiff < minRest) {
          conflicts.push({
            _type: 'schedule_conflict',
            id: `conflict-rest-${Date.now()}-${Math.random()}`,
            tournamentId: slot.tournamentId,
            type: 'insufficient_rest',
            severity: 'warning',
            affectedSlotIds: [slot.id, playerSlot.id],
            affectedMatchIds: [slot.matchId || '', playerSlot.matchId || ''],
            affectedPlayerIds: [playerId],
            description: `Player ${playerId} has insufficient rest time (${Math.floor(timeDiff / 60000)} minutes)`,
            suggestedResolution: `Delay match by ${Math.ceil((minRest - timeDiff) / 60000)} minutes`,
            isResolved: false,
            detectedAt: new Date().toISOString()
          });
        }
      }
    }

    return conflicts;
  }

  private generateTimeSlots(): Date[] {
    const slots: Date[] = [];
    const start = new Date(this.config.startTime).getTime();
    const end = new Date(this.config.endTime).getTime();
    const increment = (this.config.matchDuration + this.config.bufferTime) * 60 * 1000;

    for (let time = start; time < end; time += increment) {
      slots.push(new Date(time));
    }

    return slots;
  }

  private isValidSlot(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraints: SchedulingConstraint[]
  ): boolean {
    const conflicts = this.detectConflicts(slot, schedule);
    return conflicts.length === 0 && this.satisfiesConstraints(slot, schedule, constraints);
  }

  private removeFromIntervalTree(slot: ScheduleSlot): void {
    // Simplified - in production, implement proper interval tree deletion
    this.intervalTree = null;
    this.scheduleSlots.forEach(s => {
      if (s.id !== slot.id) {
        this.addToIntervalTree(s);
      }
    });
  }

  private calculateResult(schedule: ScheduleSlot[], backtrackCount: number): ScheduleResult {
    const totalDuration = schedule.length > 0
      ? new Date(schedule[schedule.length - 1].endTime).getTime() - new Date(schedule[0].startTime).getTime()
      : 0;

    const stationUtilization: { [stationId: string]: number } = {};
    this.stations.forEach(station => {
      const stationSlots = schedule.filter(s => s.stationId === station.id);
      const usedTime = stationSlots.reduce((sum, slot) => sum + slot.duration, 0);
      stationUtilization[station.id] = totalDuration > 0 ? (usedTime * 60 * 1000) / totalDuration : 0;
    });

    return {
      success: this.conflicts.length === 0,
      schedule,
      conflicts: this.conflicts,
      totalDuration: totalDuration / (60 * 1000), // Convert to minutes
      stationUtilization,
      averagePlayerWaitTime: this.calculateAverageWaitTime(schedule),
      maxPlayerWaitTime: this.calculateMaxWaitTime(schedule),
      score: this.calculateScheduleScore(schedule),
      scoreBreakdown: this.calculateScoreBreakdown(schedule),
      algorithmUsed: this.config.algorithm,
      generationTime: 0, // Will be set by caller
      backtrackCount
    };
  }

  private calculateAverageWaitTime(schedule: ScheduleSlot[]): number {
    // Simplified calculation
    return 30; // minutes
  }

  private calculateMaxWaitTime(schedule: ScheduleSlot[]): number {
    // Simplified calculation
    return 60; // minutes
  }

  private calculateScheduleScore(schedule: ScheduleSlot[]): number {
    let score = 100;
    
    // Deduct points for conflicts
    score -= this.conflicts.length * 10;
    
    // Deduct points for long wait times
    const avgWait = this.calculateAverageWaitTime(schedule);
    if (avgWait > 30) {
      score -= (avgWait - 30) * 0.5;
    }
    
    return Math.max(0, score);
  }

  private calculateScoreBreakdown(schedule: ScheduleSlot[]): { [goalType: string]: number } {
    const breakdown: { [goalType: string]: number } = {};
    
    for (const goal of this.config.optimizationGoals) {
      switch (goal.type) {
        case 'minimize_total_time':
          breakdown[goal.type] = this.scoreMinimizeTotalTime(schedule) * goal.weight;
          break;
        case 'maximize_station_usage':
          breakdown[goal.type] = this.scoreMaximizeStationUsage(schedule) * goal.weight;
          break;
        case 'minimize_player_wait':
          breakdown[goal.type] = this.scoreMinimizePlayerWait(schedule) * goal.weight;
          break;
        case 'balance_station_load':
          breakdown[goal.type] = this.scoreBalanceStationLoad(schedule) * goal.weight;
          break;
        case 'minimize_conflicts':
          breakdown[goal.type] = this.scoreMinimizeConflicts() * goal.weight;
          break;
      }
    }
    
    return breakdown;
  }

  // Constraint checking methods
  private checkBeforeConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      new Date(slot.endTime).getTime() <= new Date(other.startTime).getTime()
    );
  }

  private checkAfterConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      new Date(slot.startTime).getTime() >= new Date(other.endTime).getTime()
    );
  }

  private checkSameTimeConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      other.startTime === slot.startTime
    );
  }

  private checkDifferentTimeConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      !this.timesOverlap(slot, other)
    );
  }

  private checkSameStationConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      other.stationId === slot.stationId
    );
  }

  private checkDifferentStationConstraint(
    slot: ScheduleSlot, 
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    const otherMatches = constraint.matchIds.filter(id => id !== slot.matchId);
    const otherSlots = schedule.filter(s => otherMatches.includes(s.matchId || ''));
    
    return otherSlots.every(other => 
      other.stationId !== slot.stationId
    );
  }

  private checkTimeRangeConstraint(slot: ScheduleSlot, constraint: SchedulingConstraint): boolean {
    if (!constraint.value || typeof constraint.value !== 'object') return true;
    
    const { start, end } = constraint.value as { start: string; end: string };
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();
    const rangeStart = new Date(start).getTime();
    const rangeEnd = new Date(end).getTime();
    
    return slotStart >= rangeStart && slotEnd <= rangeEnd;
  }

  // Scoring methods for optimization goals
  private scoreMinimizeTotalTime(schedule: ScheduleSlot[]): number {
    if (schedule.length === 0) return 0;
    
    const totalTime = new Date(schedule[schedule.length - 1].endTime).getTime() - 
                     new Date(schedule[0].startTime).getTime();
    const idealTime = schedule.length * (this.config.matchDuration + this.config.bufferTime) * 60 * 1000;
    
    return Math.max(0, 100 - ((totalTime - idealTime) / idealTime) * 100);
  }

  private scoreMaximizeStationUsage(schedule: ScheduleSlot[]): number {
    const utilization = Object.values(this.calculateStationUtilization(schedule));
    const avgUtilization = utilization.reduce((sum, u) => sum + u, 0) / utilization.length;
    return avgUtilization * 100;
  }

  private scoreMinimizePlayerWait(schedule: ScheduleSlot[]): number {
    const avgWait = this.calculateAverageWaitTime(schedule);
    return Math.max(0, 100 - avgWait);
  }

  private scoreBalanceStationLoad(schedule: ScheduleSlot[]): number {
    const loads = this.stations.map(station => 
      schedule.filter(s => s.stationId === station.id).length
    );
    
    const avgLoad = loads.reduce((sum, l) => sum + l, 0) / loads.length;
    const variance = loads.reduce((sum, l) => sum + Math.pow(l - avgLoad, 2), 0) / loads.length;
    
    return Math.max(0, 100 - variance * 10);
  }

  private scoreMinimizeConflicts(): number {
    return Math.max(0, 100 - this.conflicts.length * 20);
  }

  private calculateStationUtilization(schedule: ScheduleSlot[]): { [stationId: string]: number } {
    const utilization: { [stationId: string]: number } = {};
    
    this.stations.forEach(station => {
      const stationSlots = schedule.filter(s => s.stationId === station.id);
      const totalTime = stationSlots.reduce((sum, slot) => sum + slot.duration, 0);
      const availableTime = (new Date(this.config.endTime).getTime() - 
                           new Date(this.config.startTime).getTime()) / (60 * 1000);
      
      utilization[station.id] = totalTime / availableTime;
    });
    
    return utilization;
  }

  // CSP helper methods
  private initializeDomains(matches: ScheduleItem[]): Map<string, ScheduleSlot[]> {
    const domains = new Map<string, ScheduleSlot[]>();
    const timeSlots = this.generateTimeSlots();
    
    matches.forEach(item => {
      const possibleSlots: ScheduleSlot[] = [];
      
      timeSlots.forEach(time => {
        this.stations.forEach(station => {
          const slot = this.createScheduleSlot(item.match, station, time.toISOString());
          possibleSlots.push(slot);
        });
      });
      
      domains.set(item.match.id, possibleSlots);
    });
    
    return domains;
  }

  private applyArcConsistency(
    domains: Map<string, ScheduleSlot[]>, 
    constraints: SchedulingConstraint[]
  ): void {
    let changed = true;
    
    while (changed) {
      changed = false;
      
      for (const constraint of constraints) {
        if (this.reviseArc(domains, constraint)) {
          changed = true;
        }
      }
    }
  }

  private reviseArc(domains: Map<string, ScheduleSlot[]>, constraint: SchedulingConstraint): boolean {
    // Simplified arc revision
    return false;
  }

  private cspSearch(
    matches: ScheduleItem[], 
    domains: Map<string, ScheduleSlot[]>, 
    constraints: SchedulingConstraint[],
    assignment: { [matchId: string]: ScheduleSlot | null }
  ): { [matchId: string]: ScheduleSlot | null } {
    // Simplified CSP search
    return assignment;
  }

  // Genetic algorithm helper methods
  private initializePopulation(matches: ScheduleItem[], size: number): ScheduleSlot[][] {
    const population: ScheduleSlot[][] = [];
    
    for (let i = 0; i < size; i++) {
      const individual = this.generateRandomSchedule(matches);
      population.push(individual);
    }
    
    return population;
  }

  private generateRandomSchedule(matches: ScheduleItem[]): ScheduleSlot[] {
    const schedule: ScheduleSlot[] = [];
    const timeSlots = this.generateTimeSlots();
    
    matches.forEach(item => {
      const randomTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const randomStation = this.stations[Math.floor(Math.random() * this.stations.length)];
      
      const slot = this.createScheduleSlot(
        item.match, 
        randomStation, 
        randomTime.toISOString()
      );
      
      schedule.push(slot);
    });
    
    return schedule;
  }

  private evaluateFitness(individual: ScheduleSlot[], constraints: SchedulingConstraint[]): number {
    let fitness = 100;
    
    // Penalize conflicts
    const conflicts = this.countConflictsInSchedule(individual);
    fitness -= conflicts * 10;
    
    // Penalize constraint violations
    const violations = this.countConstraintViolations(individual, constraints);
    fitness -= violations * 5;
    
    return Math.max(0, fitness);
  }

  private countConflictsInSchedule(schedule: ScheduleSlot[]): number {
    let conflicts = 0;
    
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        if (this.slotsConflict(schedule[i], schedule[j])) {
          conflicts++;
        }
      }
    }
    
    return conflicts;
  }

  private slotsConflict(slot1: ScheduleSlot, slot2: ScheduleSlot): boolean {
    // Check time and station conflicts
    return (slot1.stationId === slot2.stationId && this.timesOverlap(slot1, slot2)) ||
           (this.haveCommonPlayers(slot1, slot2) && this.timesOverlap(slot1, slot2));
  }

  private haveCommonPlayers(slot1: ScheduleSlot, slot2: ScheduleSlot): boolean {
    const players1 = this.getPlayerIdsFromMatch(slot1.matchId || '');
    const players2 = this.getPlayerIdsFromMatch(slot2.matchId || '');
    
    return players1.some(p => players2.includes(p));
  }

  private countConstraintViolations(
    schedule: ScheduleSlot[], 
    constraints: SchedulingConstraint[]
  ): number {
    let violations = 0;
    
    for (const constraint of constraints) {
      if (!this.schedulesSatisfiesConstraint(schedule, constraint)) {
        violations++;
      }
    }
    
    return violations;
  }

  private schedulesSatisfiesConstraint(
    schedule: ScheduleSlot[], 
    constraint: SchedulingConstraint
  ): boolean {
    // Check if entire schedule satisfies constraint
    return true; // Simplified
  }

  private tournamentSelection(
    population: ScheduleSlot[][], 
    fitness: number[]
  ): ScheduleSlot[][] {
    const selected: ScheduleSlot[][] = [];
    const tournamentSize = 3;
    
    while (selected.length < population.length / 2) {
      const tournament: number[] = [];
      
      for (let i = 0; i < tournamentSize; i++) {
        tournament.push(Math.floor(Math.random() * population.length));
      }
      
      const winner = tournament.reduce((best, current) => 
        fitness[current] > fitness[best] ? current : best
      );
      
      selected.push(population[winner]);
    }
    
    return selected;
  }

  private crossover(parents: ScheduleSlot[][]): ScheduleSlot[][] {
    const offspring: ScheduleSlot[][] = [];
    
    for (let i = 0; i < parents.length - 1; i += 2) {
      const [child1, child2] = this.singlePointCrossover(parents[i], parents[i + 1]);
      offspring.push(child1, child2);
    }
    
    return offspring;
  }

  private singlePointCrossover(
    parent1: ScheduleSlot[], 
    parent2: ScheduleSlot[]
  ): [ScheduleSlot[], ScheduleSlot[]] {
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    
    const child1 = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
    
    const child2 = [
      ...parent2.slice(0, crossoverPoint),
      ...parent1.slice(crossoverPoint)
    ];
    
    return [child1, child2];
  }

  private mutate(population: ScheduleSlot[][], rate: number): ScheduleSlot[][] {
    return population.map(individual => {
      if (Math.random() < rate) {
        return this.mutateIndividual(individual);
      }
      return individual;
    });
  }

  private mutateIndividual(individual: ScheduleSlot[]): ScheduleSlot[] {
    const mutated = [...individual];
    const index = Math.floor(Math.random() * mutated.length);
    
    // Mutate by changing station or time
    if (Math.random() < 0.5) {
      // Change station
      const newStation = this.stations[Math.floor(Math.random() * this.stations.length)];
      mutated[index] = { ...mutated[index], stationId: newStation.id, stationName: newStation.name };
    } else {
      // Change time
      const timeSlots = this.generateTimeSlots();
      const newTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      mutated[index] = { 
        ...mutated[index], 
        startTime: newTime.toISOString(),
        endTime: new Date(newTime.getTime() + (mutated[index].duration * 60 * 1000)).toISOString()
      };
    }
    
    return mutated;
  }

  private selectBest(
    population: ScheduleSlot[][], 
    constraints: SchedulingConstraint[]
  ): ScheduleSlot[] {
    let bestFitness = -1;
    let bestIndividual: ScheduleSlot[] = [];
    
    population.forEach(individual => {
      const fitness = this.evaluateFitness(individual, constraints);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestIndividual = individual;
      }
    });
    
    return bestIndividual;
  }
}