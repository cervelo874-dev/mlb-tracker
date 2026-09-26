export interface Team {
  id: number;
  name: string;
  link: string;
  abbreviation?: string;
  teamName?: string;
  locationName?: string;
  shortName?: string;
  clubName?: string;
}

export interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  primaryColor: string;
  league: 'AL' | 'NL';
  division: string;
}

export interface GameStatus {
  abstractGameState: 'Live' | 'Preview' | 'Final';
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD?: boolean;
  abstractGameCode: string;
}

export interface InningHalfScore {
  runs?: number;
  hits?: number;
  errors?: number;
  leftOnBase?: number;
}

export interface InningLinescore {
  num: number;
  ordinalNum: string;
  home: InningHalfScore;
  away: InningHalfScore;
}

export interface LinescoreTeam {
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

export interface PlayerBasic {
  id: number;
  fullName: string;
  link: string;
}

export interface LinescoreOffense {
  batter?: PlayerBasic;
  onDeck?: PlayerBasic;
  inHole?: PlayerBasic;
  pitcher?: PlayerBasic;
  first?: PlayerBasic;
  second?: PlayerBasic;
  third?: PlayerBasic;
}

export interface LinescoreDefense {
  pitcher?: PlayerBasic;
  catcher?: PlayerBasic;
  first?: PlayerBasic;
  second?: PlayerBasic;
  third?: PlayerBasic;
  shortstop?: PlayerBasic;
  left?: PlayerBasic;
  center?: PlayerBasic;
  right?: PlayerBasic;
  batter?: PlayerBasic;
  inHole?: PlayerBasic;
  onDeck?: PlayerBasic;
}

export interface Linescore {
  currentInning?: number;
  currentInningOrdinal?: string;
  inningState?: 'Top' | 'Middle' | 'Bottom' | 'End';
  inningHalf?: 'Top' | 'Bottom';
  isTopInning?: boolean;
  scheduledInnings?: number;
  innings?: InningLinescore[];
  teams?: {
    home: LinescoreTeam;
    away: LinescoreTeam;
  };
  defense?: LinescoreDefense;
  offense?: LinescoreOffense;
  balls?: number;
  strikes?: number;
  outs?: number;
}

export interface PitchCoordinates {
  x?: number;
  y?: number;
  pX?: number;
  pZ?: number;
  aX?: number;
  aY?: number;
  aZ?: number;
  pfxX?: number;
  pfxZ?: number;
  vX0?: number;
  vY0?: number;
  vZ0?: number;
  x0?: number;
  y0?: number;
  z0?: number;
}

export interface PitchData {
  startSpeed?: number;
  endSpeed?: number;
  strikeZoneTop?: number;
  strikeZoneBottom?: number;
  coordinates?: PitchCoordinates;
  type?: string;
  zone?: number;
  typeConfidence?: number;
  plateTime?: number;
  extension?: number;
}

export interface HitData {
  launchSpeed?: number;
  launchAngle?: number;
  totalDistance?: number;
  trajectory?: string;
  hardness?: string;
  location?: string;
  coordinates?: {
    coordX?: number;
    coordY?: number;
  };
}

export interface PlayEventDetails {
  call?: {
    code: string;
    description: string;
  };
  description?: string;
  event?: string;
  eventType?: string;
  awayScore?: number;
  homeScore?: number;
  isOut?: boolean;
  hasReview?: boolean;
  isBall?: boolean;
  isStrike?: boolean;
  isInPlay?: boolean;
  type?: {
    code: string;
    description: string;
  };
}

export interface PlayCount {
  balls: number;
  strikes: number;
  outs: number;
}

export interface PlayEvent {
  details: PlayEventDetails;
  count: PlayCount;
  pitchData?: PitchData;
  hitData?: HitData;
  index: number;
  pfxId?: string;
  playId?: string;
  pitchNumber?: number;
  startTime?: string;
  endTime?: string;
  isPitch: boolean;
  type: string;
}

export interface PlayMatchup {
  batter: PlayerBasic;
  batSide?: { code: string; description: string };
  pitcher: PlayerBasic;
  pitchHand?: { code: string; description: string };
  postOnFirst?: PlayerBasic;
  postOnSecond?: PlayerBasic;
  postOnThird?: PlayerBasic;
}

export interface PlayResult {
  type: string;
  event: string;
  eventType: string;
  description: string;
  rbi?: number;
  awayScore?: number;
  homeScore?: number;
  isOut?: boolean;
}

export interface PlayAbout {
  atBatIndex: number;
  halfInning: 'top' | 'bottom';
  isTopInning: boolean;
  inning: number;
  startTime?: string;
  endTime?: string;
  isComplete: boolean;
  isScoringPlay?: boolean;
  hasReview?: boolean;
  hasOut?: boolean;
  captivatingIndex?: number;
}

export interface Play {
  result: PlayResult;
  about: PlayAbout;
  count: PlayCount;
  matchup: PlayMatchup;
  pitchIndex: number[];
  actionIndex: number[];
  runnerIndex: number[];
  runners: any[];
  playEvents: PlayEvent[];
  playEndTime?: string;
  atBatIndex: number;
}

export interface ScheduleGameTeam {
  team: Team;
  score?: number;
  isWinner?: boolean;
  splitSquad?: boolean;
  seriesNumber?: number;
  leagueRecord?: {
    wins: number;
    losses: number;
    pct: string;
  };
  probablePitcher?: {
    id: number;
    fullName: string;
    link: string;
  };
}

export interface ScheduleGame {
  gamePk: number;
  gameGuid?: string;
  link: string;
  gameType: string;
  season: string;
  gameDate: string;
  officialDate: string;
  status: GameStatus;
  teams: {
    away: ScheduleGameTeam;
    home: ScheduleGameTeam;
  };
  venue?: {
    id: number;
    name: string;
    link: string;
  };
  linescore?: Linescore;
}

export interface LiveGameFeed {
  gamePk: number;
  link: string;
  metaData: {
    wait: number;
    timeStamp: string;
  };
  gameData: {
    game: {
      pk: number;
      type: string;
      doubleHeader: string;
      id: string;
      gamedayType: string;
      tiebreaker: string;
      gameNumber: number;
      calendarEventID: string;
      season: string;
      seasonDisplay: string;
    };
    datetime: {
      dateTime: string;
      originalDate: string;
      officialDate: string;
      dayNight: string;
      time: string;
      ampm: string;
    };
    status: GameStatus;
    teams: {
      away: Team & {
        abbreviation: string;
        teamName: string;
        clubName: string;
        locationName: string;
        division?: { id: number; name: string };
        league?: { id: number; name: string };
      };
      home: Team & {
        abbreviation: string;
        teamName: string;
        clubName: string;
        locationName: string;
        division?: { id: number; name: string };
        league?: { id: number; name: string };
      };
    };
    players: Record<string, {
      id: number;
      fullName: string;
      primaryNumber?: string;
      currentTeam?: { id: number };
      primaryPosition?: { code: string; name: string; type: string; abbreviation: string };
      batSide?: { code: string; description: string };
      pitchHand?: { code: string; description: string };
      stats?: any;
    }>;
    venue: {
      id: number;
      name: string;
    };
    probablePitchers?: {
      away?: PlayerBasic;
      home?: PlayerBasic;
    };
  };
  liveData: {
    plays: {
      allPlays: Play[];
      currentPlay?: Play;
      scoringPlays: number[];
    };
    linescore: Linescore;
    boxscore?: {
      teams: {
        away: any;
        home: any;
      };
    };
    decisions?: {
      winner?: PlayerBasic;
      loser?: PlayerBasic;
      save?: PlayerBasic;
    };
  };
}
