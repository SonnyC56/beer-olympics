/**
 * Multi-Station Scheduling Types
 * Core types for managing game stations and match scheduling
 */

import type { Match } from './tournament';

/**
 * Physical game station where matches are played
 */
export interface Station {
  _type: 'station';
  id: string;
  name: string;
  tournamentId: string;
  
  // Station details
  description?: string;
  location?: string;
  capacity?: number; // Max players/spectators
  
  // Equipment and games
  gameTypes?: string[]; // Types of games this station supports
  equipment?: string[]; // Available equipment at this station
  
  // Status
  isActive: boolean;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  
  // Current match
  currentMatchId?: string;
  currentMatchStartTime?: string;
  
  // Statistics
  totalMatchesPlayed?: number;
  averageMatchDuration?: number; // in minutes
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Time slot for scheduling matches
 */
export interface ScheduleSlot {
  _type: 'schedule_slot';
  id: string;
  tournamentId: string;
  
  // Timing
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  duration: number; // in minutes
  
  // Station assignment
  stationId: string;
  stationName?: string;
  
  // Match assignment
  matchId?: string;
  round?: number;
  
  // Status
  status: 'available' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Buffer time
  bufferBefore?: number; // minutes before next slot
  bufferAfter?: number; // minutes after previous slot
  
  // Conflict tracking
  hasConflict?: boolean;
  conflictReason?: string;
  conflictingSlotIds?: string[];
  
  createdAt: string;
  updatedAt: string;
}

/**
 * Player availability constraints
 */
export interface PlayerAvailability {
  _type: 'player_availability';
  playerId: string;
  tournamentId: string;
  
  // Availability windows
  availableWindows: TimeWindow[];
  
  // Blackout periods
  blackoutPeriods: TimeWindow[];
  
  // Preferences
  preferredTimes?: TimeWindow[];
  preferredStations?: string[];
  
  // Constraints
  minRestBetweenMatches?: number; // in minutes
  maxMatchesPerDay?: number;
  maxConsecutiveMatches?: number;
  
  updatedAt: string;
}

/**
 * Time window for availability
 */
export interface TimeWindow {
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  recurring?: RecurringPattern;
  priority?: 'required' | 'preferred' | 'optional';
  note?: string;
}

/**
 * Recurring pattern for time windows
 */
export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  endDate?: string; // When recurrence ends
  exceptions?: string[]; // Dates to skip
}

/**
 * Schedule conflict information
 */
export interface ScheduleConflict {
  _type: 'schedule_conflict';
  id: string;
  tournamentId: string;
  
  // Conflict type
  type: 'player_double_booked' | 'station_overlap' | 'insufficient_rest' | 'availability_violation';
  severity: 'warning' | 'error' | 'critical';
  
  // Affected entities
  affectedSlotIds: string[];
  affectedMatchIds: string[];
  affectedPlayerIds?: string[];
  affectedStationIds?: string[];
  
  // Conflict details
  description: string;
  suggestedResolution?: string;
  
  // Resolution
  isResolved: boolean;
  resolutionAction?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  
  detectedAt: string;
}

/**
 * Scheduling algorithm configuration
 */
export interface SchedulingConfig {
  // Algorithm selection
  algorithm: 'greedy' | 'backtracking' | 'genetic' | 'constraint_satisfaction';
  
  // Time constraints
  startTime: string; // Tournament start time
  endTime: string; // Tournament end time
  matchDuration: number; // Default match duration in minutes
  bufferTime: number; // Buffer between matches
  
  // Station constraints
  maxStations: number;
  stationPreferences?: { [matchId: string]: string[] }; // Preferred stations per match
  
  // Player constraints
  minRestTime: number; // Minimum rest between matches for a player
  maxConcurrentMatches?: number; // Max matches at same time
  respectAvailability: boolean;
  
  // Optimization goals
  optimizationGoals: SchedulingOptimizationGoal[];
  
  // Advanced options
  allowFlexibleStartTimes?: boolean;
  allowStationChanges?: boolean;
  prioritizeHigherSeeds?: boolean;
  groupByRound?: boolean;
}

/**
 * Optimization goals for scheduling
 */
export interface SchedulingOptimizationGoal {
  type: 'minimize_total_time' | 'maximize_station_usage' | 'minimize_player_wait' | 'balance_station_load' | 'minimize_conflicts';
  weight: number; // 0-1, relative importance
  constraints?: any; // Goal-specific constraints
}

/**
 * Schedule generation result
 */
export interface ScheduleResult {
  success: boolean;
  schedule: ScheduleSlot[];
  conflicts: ScheduleConflict[];
  
  // Metrics
  totalDuration: number; // in minutes
  stationUtilization: { [stationId: string]: number }; // percentage
  averagePlayerWaitTime: number; // in minutes
  maxPlayerWaitTime: number; // in minutes
  
  // Optimization score
  score: number;
  scoreBreakdown: { [goalType: string]: number };
  
  // Generation metadata
  algorithmUsed: string;
  generationTime: number; // milliseconds
  iterations?: number;
  backtrackCount?: number;
}

/**
 * Real-time schedule update
 */
export interface ScheduleUpdate {
  _type: 'schedule_update';
  tournamentId: string;
  updateType: 'delay' | 'cancellation' | 'reschedule' | 'station_change' | 'duration_change';
  
  // Affected entities
  affectedSlotIds: string[];
  affectedMatchIds: string[];
  
  // Update details
  reason: string;
  previousValues?: Partial<ScheduleSlot>[];
  newValues: Partial<ScheduleSlot>[];
  
  // Cascading effects
  cascadingUpdates?: ScheduleUpdate[];
  
  // Metadata
  updatedBy: string;
  updatedAt: string;
  autoGenerated: boolean;
}

/**
 * Station assignment recommendation
 */
export interface StationRecommendation {
  matchId: string;
  recommendedStations: {
    stationId: string;
    score: number; // 0-100
    reasons: string[];
  }[];
  constraints: string[];
}

/**
 * Schedule analytics
 */
export interface ScheduleAnalytics {
  tournamentId: string;
  generatedAt: string;
  
  // Time metrics
  tournamentDuration: number; // total minutes
  averageMatchDuration: number;
  totalBufferTime: number;
  
  // Station metrics
  stationUtilization: {
    stationId: string;
    utilizationPercentage: number;
    totalMatches: number;
    idleTime: number; // minutes
  }[];
  
  // Player metrics
  playerWaitTimes: {
    playerId: string;
    averageWaitTime: number;
    maxWaitTime: number;
    totalWaitTime: number;
  }[];
  
  // Conflict metrics
  totalConflicts: number;
  conflictsByType: { [type: string]: number };
  resolvedConflicts: number;
  
  // Efficiency metrics
  scheduleEfficiency: number; // 0-100
  recommendedImprovements: string[];
}

/**
 * Match with scheduling information
 */
export interface ScheduledMatch extends Match {
  // Scheduling info
  scheduledSlotId?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduledStationId?: string;
  scheduledStationName?: string;
  
  // Actual timing
  actualStartTime?: string;
  actualEndTime?: string;
  actualDuration?: number; // minutes
  
  // Delays
  delayReason?: string;
  delayMinutes?: number;
  
  // Readiness
  teamAReady?: boolean;
  teamBReady?: boolean;
  stationReady?: boolean;
  refereeReady?: boolean;
}

/**
 * Bulk scheduling request
 */
export interface BulkScheduleRequest {
  tournamentId: string;
  matchIds: string[];
  config: SchedulingConfig;
  constraints?: SchedulingConstraint[];
  preview?: boolean; // If true, don't save, just return preview
}

/**
 * Custom scheduling constraint
 */
export interface SchedulingConstraint {
  type: 'before' | 'after' | 'same_time' | 'different_time' | 'same_station' | 'different_station' | 'time_range';
  matchIds: string[];
  value?: any; // Constraint-specific value
  priority: 'soft' | 'hard'; // Soft can be violated if needed
  reason?: string;
}

/**
 * Schedule export format
 */
export interface ScheduleExport {
  tournament: {
    id: string;
    name: string;
    date: string;
  };
  stations: Station[];
  schedule: {
    round: number;
    slots: {
      time: string;
      station: string;
      match: {
        teamA: string;
        teamB: string;
        event?: string;
      };
    }[];
  }[];
  generatedAt: string;
  format: 'pdf' | 'csv' | 'ical' | 'json';
}