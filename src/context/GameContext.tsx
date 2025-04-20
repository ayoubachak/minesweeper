import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Difficulty, GameBoard, GameStatus, Position } from '../types/game.types';
import { SettingsContext } from './SettingsContext';
import * as gameService from '../services/gameService';
import * as storageService from '../services/storageService';

// Action types
type GameAction = 
  | { type: 'INIT_GAME'; payload: { rows: number; cols: number; mines: number } }
  | { type: 'REVEAL_CELL'; payload: Position }
  | { type: 'TOGGLE_FLAG'; payload: Position }
  | { type: 'CHORD_CELL'; payload: Position }
  | { type: 'START_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'GAME_WON' }
  | { type: 'GAME_LOST' };

// Context type
interface GameContextType {
  gameBoard: GameBoard;
  initGame: (rows: number, cols: number, mines: number) => void;
  revealCell: (position: Position) => void;
  toggleFlag: (position: Position) => void;
  chordCell: (position: Position) => void;
  startGame: () => void;
  restartGame: () => void;
}

// Create context
export const GameContext = createContext<GameContextType>({} as GameContextType);

// Game reducer
const gameReducer = (state: GameBoard, action: GameAction): GameBoard => {
  switch (action.type) {
    case 'INIT_GAME':
      return gameService.createBoard(
        action.payload.rows,
        action.payload.cols,
        action.payload.mines
      );
    
    case 'REVEAL_CELL':
      const newStateAfterReveal = gameService.revealCell(state, action.payload);
      
      // Check if the game is over after revealing
      if (newStateAfterReveal.status === GameStatus.LOST) {
        return gameService.revealAllMines(newStateAfterReveal);
      }
      
      return newStateAfterReveal;
    
    case 'TOGGLE_FLAG':
      return gameService.toggleFlag(state, action.payload);
    
    case 'CHORD_CELL':
      return gameService.chordCell(state, action.payload);
    
    case 'START_GAME':
      return gameService.startGame(state);
    
    case 'RESTART_GAME':
      return gameService.createBoard(state.rows, state.cols, state.mines);
      
    default:
      return state;
  }
};

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useContext(SettingsContext);
  
  // Initialize game board
  const initialState: GameBoard = useMemo(() => (
    gameService.createBoard(
      settings.rows,
      settings.cols,
      settings.mines
    )
  ), [settings.rows, settings.cols, settings.mines]);
  
  // Game state
  const [gameBoard, dispatch] = useReducer(gameReducer, initialState);
  
  // Initialize game with new settings
  useEffect(() => {
    dispatch({
      type: 'INIT_GAME',
      payload: {
        rows: settings.rows,
        cols: settings.cols,
        mines: settings.mines
      }
    });
  }, [settings.rows, settings.cols, settings.mines]);
  
  // Save score when game is won
  useEffect(() => {
    if (gameBoard.status === GameStatus.WON && gameBoard.startTime && gameBoard.endTime) {
      const time = gameBoard.endTime - gameBoard.startTime;
      
      storageService.saveScore({
        difficulty: settings.difficulty,
        rows: gameBoard.rows,
        cols: gameBoard.cols,
        mines: gameBoard.mines,
        time,
      });
    }
  }, [gameBoard, settings.difficulty]);
  
  // Action functions
  const initGame = useCallback((rows: number, cols: number, mines: number) => {
    dispatch({ type: 'INIT_GAME', payload: { rows, cols, mines } });
  }, []);
  
  const revealCell = useCallback((position: Position) => {
    dispatch({ type: 'REVEAL_CELL', payload: position });
  }, []);
  
  const toggleFlag = useCallback((position: Position) => {
    dispatch({ type: 'TOGGLE_FLAG', payload: position });
  }, []);
  
  const chordCell = useCallback((position: Position) => {
    dispatch({ type: 'CHORD_CELL', payload: position });
  }, []);
  
  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);
  
  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);
  
  // Context value
  const value = useMemo(() => ({
    gameBoard,
    initGame,
    revealCell,
    toggleFlag,
    chordCell,
    startGame,
    restartGame,
  }), [gameBoard, initGame, revealCell, toggleFlag, chordCell, startGame, restartGame]);
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 