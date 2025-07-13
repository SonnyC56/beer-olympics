// Type declarations for tournament-js packages

declare module 'duel' {
  interface DuelOptions {
    short?: boolean;
    bronze?: boolean;
  }

  class Duel {
    matches: any[];
    constructor(numPlayers: number, options?: DuelOptions);
    score(matchId: any, scores: number[]): boolean;
    results(): any[];
    isDone(): boolean;
  }

  export = Duel;
}

declare module 'group' {
  interface GroupOptions {
    groupSize: number;
    advancers?: number;
  }

  class Group {
    matches: any[];
    constructor(numPlayers: number, options: GroupOptions);
    score(matchId: any, scores: number[]): boolean;
    results(): any[];
    isDone(): boolean;
  }

  export = Group;
}

declare module 'ffa' {
  interface FFAOptions {
    limit: number;
    advancers: number;
  }

  class FFA {
    matches: any[];
    constructor(numPlayers: number, options: FFAOptions);
    score(matchId: any, scores: number[]): boolean;
    results(): any[];
    isDone(): boolean;
  }

  export = FFA;
}

declare module 'masters' {
  interface MastersOptions {
    limit: number;
    maxRounds: number;
  }

  class Masters {
    matches: any[];
    constructor(numPlayers: number, options: MastersOptions);
    score(matchId: any, scores: number[]): boolean;
    results(): any[];
    isDone(): boolean;
  }

  export = Masters;
}

declare module 'tiebreaker' {
  interface TiebreakerOptions {
    compareBy?: 'head2head' | 'total';
  }

  class Tiebreaker {
    constructor(tournament: any, players: number[], options?: TiebreakerOptions);
    sorted(): number[];
  }

  export = Tiebreaker;
}

declare module 'roundrobin' {
  function roundrobin(numPlayers: number, playerNames?: string[]): any[][];
  export = roundrobin;
}