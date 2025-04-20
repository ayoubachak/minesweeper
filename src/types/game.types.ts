export enum GameStatus {
  READY = 'ready',
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
  CUSTOM = 'custom',
}

export enum GameMode {
  BOMB = 'bomb',  // Left click reveals, right click flags (default)
  FLAG = 'flag',  // Left click flags, right click reveals
}

export interface CellState {
  revealed: boolean;
  isMine: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameBoard {
  cells: CellState[][];
  rows: number;
  cols: number;
  mines: number;
  minesRemaining: number;
  status: GameStatus;
  startTime: number | null;
  endTime: number | null;
}

export interface GameScore {
  id: string;
  difficulty: Difficulty;
  rows: number;
  cols: number;
  mines: number;
  time: number; // milliseconds
  date: number; // timestamp
}

export interface GameSettings {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  mines: number;
  showTimer: boolean;
  enableAnimations: boolean;
  theme: string;
  gameMode: GameMode; // New property for input mode
} 