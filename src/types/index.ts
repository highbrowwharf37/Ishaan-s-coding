export type RawTeamArray = (string | number | null)[];
export type RawPlayerArray = (string | number | null)[];

export interface RawDataResponse {
  teams: RawTeamArray[];
  players: RawPlayerArray[];
  updated: string;
}

export interface Team {
  name: string;
  conf: string;
  w: number;
  l: number;
  record: string;
  adjOE: number;
  adjDE: number;
  netEM: number;
  barthag: number;
  sos: number;
  wab: number;
  adjT: number;
  oppO: number;
  oppD: number;
  raw: RawTeamArray;
}

export interface TeamWithSOL extends Team {
  solScore: number;
  solLabel: 'Elite' | 'Good' | 'Average' | 'Poor';
  solClass: 'sol-elite' | 'sol-good' | 'sol-avg' | 'sol-poor';
}

export interface Player {
  name: string;
  team: string;
  conf: string;
  gp: number;
  min: number;
  ortg: number;
  usg: number;
  efg: number;
  ts: number;
  ppg: number;
  rpg: number;
  apg: number;
  bpm: number;
  obpm: number;
  dbpm: number;
  pos: string;
  yr: string;
}

export interface DraftProspect {
  pick: number;
  name: string;
  school: string;
  pos: string;
  yr: string;
  age: number;
  ht: string;
  wt: string;
  wingspan: string;
  ppg: number;
  rpg: number;
  apg: number;
  fg: number;
  tsp: number;
  team: string;
  teamNeed: string;
  nbaComp: string;
  analysis: string;
  tier: 'Franchise' | 'Star' | 'Starter';
  tierColor: string;
}

export interface PredictorResult {
  teamA: TeamWithSOL;
  teamB: TeamWithSOL;
  baseWinA: number;
  adjWinA: number;
  adjWinB: number;
  isClose: boolean;
  solFlipped: boolean;
  solAdj: number;
  scoreA: string;
  scoreB: string;
  pctA: string;
  pctB: string;
}

export type TabId =
  | 'power'
  | 'efficiency'
  | 'sos'
  | 'predictor'
  | 'bubble'
  | 'momentum'
  | 'h2h'
  | 'upset'
  | 'confstrength'
  | 'cinderella'
  | 'draftboard';

export type DataStatus = 'loading' | 'success' | 'error';

export interface DataState {
  teams: Team[];
  players: Player[];
  updated: string | null;
  status: DataStatus;
  error: string | null;
}
