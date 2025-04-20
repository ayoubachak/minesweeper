import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Difficulty, GameBoard, GameStatus, Position } from '../types/game.types';
import { SettingsContext } from './SettingsContext';
import * as gameService from '../services/gameService';
import * as storageService from '../services/storageService';
import * as gameHistoryService from '../services/gameHistoryService';

// Action types
type GameAction = 
  | { type: 'INIT_GAME'; payload: { rows: number; cols: number; mines: number } }
  | { type: 'REVEAL_CELL'; payload: Position }
  | { type: 'TOGGLE_FLAG'; payload: Position }
  | { type: 'CHORD_CELL'; payload: Position }
  | { type: 'START_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'GAME_WON' }
  | { type: 'GAME_LOST' }
  | { type: 'SET_BOARD'; payload: GameBoard }; // For game replay

// Context type
interface GameContextType {
  gameBoard: GameBoard;
  initGame: (rows: number, cols: number, mines: number) => void;
  revealCell: (position: Position) => void;
  toggleFlag: (position: Position) => void;
  chordCell: (position: Position) => void;
  startGame: () => void;
  restartGame: () => void;
  gameHistory: gameHistoryService.GameHistoryEntry[];
  currentGameId: string | null;
  isReplayMode: boolean;
  replayGame: (gameId: string) => void;
  replayStep: (stepIndex: number) => void;
  currentReplayStep: number;
  totalReplaySteps: number;
  exitReplay: () => void;
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
    
    case 'SET_BOARD':
      return action.payload;
      
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
  
  // Game history state
  const [gameHistory, setGameHistory] = useState<gameHistoryService.GameHistoryEntry[]>([]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [currentReplayStep, setCurrentReplayStep] = useState(0);
  const [replayGame, setReplayGame] = useState<gameHistoryService.GameHistoryEntry | null>(null);
  
  // Load game history on mount
  useEffect(() => {
    const history = gameHistoryService.getGameHistory();
    setGameHistory(history);
    
    // Check if there's a current game in progress
    const currentGame = gameHistoryService.getCurrentGame();
    if (currentGame) {
      setCurrentGameId(currentGame.id);
    }
  }, []);
  
  // Initialize game with new settings
  useEffect(() => {
    if (isReplayMode) return; // Don't initialize during replay
    
    console.log('Initializing game with settings:', settings.rows, settings.cols, settings.mines);
    
    dispatch({
      type: 'INIT_GAME',
      payload: {
        rows: settings.rows,
        cols: settings.cols,
        mines: settings.mines
      }
    });
    
    // Start a new game history entry - only do this once when settings change
    const gameId = gameHistoryService.initGameHistory(gameBoard);
    setCurrentGameId(gameId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.rows, settings.cols, settings.mines, isReplayMode]); // Removed gameBoard dependency
  
  // Save score when game is won
  useEffect(() => {
    if (isReplayMode) return; // Don't save scores during replay
    
    if (gameBoard.status === GameStatus.WON && gameBoard.startTime && gameBoard.endTime) {
      try {
        const time = gameBoard.endTime - gameBoard.startTime;
        
        const savedScore = storageService.saveScore({
          difficulty: settings.difficulty,
          rows: gameBoard.rows,
          cols: gameBoard.cols,
          mines: gameBoard.mines,
          time,
        });
        
        console.log('Score saved successfully:', savedScore);
        
        // Refresh game history
        const history = gameHistoryService.getGameHistory();
        setGameHistory(history);
      } catch (err) {
        console.error('Error saving score:', err);
      }
    }
  }, [gameBoard, settings.difficulty, isReplayMode]);
  
  // Action functions
  const initGame = useCallback((rows: number, cols: number, mines: number) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    dispatch({ type: 'INIT_GAME', payload: { rows, cols, mines } });
    
    // Create a new game ID after initializing
    const newGameBoard = gameService.createBoard(rows, cols, mines);
    const gameId = gameHistoryService.initGameHistory(newGameBoard);
    setCurrentGameId(gameId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode]); // Removed gameBoard dependency
  
  const revealCell = useCallback((position: Position) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'REVEAL_CELL', payload: position });
    
    // Then record the action with a slight delay to ensure the state update happens first
    setTimeout(() => {
      const updatedBoard = gameService.revealCell(gameBoard, position);
      gameHistoryService.recordGameAction('REVEAL', updatedBoard, position);
    }, 0);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard]);
  
  const toggleFlag = useCallback((position: Position) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'TOGGLE_FLAG', payload: position });
    
    // Then record the action with a slight delay to ensure the state update happens first
    setTimeout(() => {
      const updatedBoard = gameService.toggleFlag(gameBoard, position);
      gameHistoryService.recordGameAction('FLAG', updatedBoard, position);
    }, 0);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard]);
  
  const chordCell = useCallback((position: Position) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'CHORD_CELL', payload: position });
    
    // Then record the action with a slight delay to ensure the state update happens first
    setTimeout(() => {
      const updatedBoard = gameService.chordCell(gameBoard, position);
      gameHistoryService.recordGameAction('CHORD', updatedBoard, position);
    }, 0);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard]);
  
  const startGame = useCallback(() => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'START_GAME' });
    
    // Then record the action with a slight delay to ensure the state update happens first
    setTimeout(() => {
      const updatedBoard = gameService.startGame(gameBoard);
      gameHistoryService.recordGameAction('START', updatedBoard);
    }, 0);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard]);
  
  const restartGame = useCallback(() => {
    if (isReplayMode) {
      // Exit replay mode if active
      setIsReplayMode(false);
      setReplayGame(null);
      setCurrentReplayStep(0);
    }
    
    dispatch({ type: 'RESTART_GAME' });
    
    // Create a fresh game board for the history
    const newGameBoard = gameService.createBoard(
      settings.rows,
      settings.cols,
      settings.mines
    );
    
    // Start a new game history entry
    const gameId = gameHistoryService.initGameHistory(newGameBoard);
    setCurrentGameId(gameId);
    
    // Record action in history
    gameHistoryService.recordGameAction('RESTART', newGameBoard);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, settings.rows, settings.cols, settings.mines]);
  
  // Game replay functions
  const handleReplayGame = useCallback((gameId: string) => {
    const game = gameHistoryService.getGameById(gameId);
    if (!game) return;
    
    setReplayGame(game);
    setIsReplayMode(true);
    setCurrentReplayStep(0);
    
    // Set the initial board state
    dispatch({ type: 'SET_BOARD', payload: game.gameBoard });
  }, []);
  
  const handleReplayStep = useCallback((stepIndex: number) => {
    if (!replayGame || !isReplayMode) return;
    
    // TODO: Implement a proper replay that reconstructs the board state
    // For now, we'll just jump to different points in the action history
    
    setCurrentReplayStep(stepIndex);
    
    // In a real implementation, we would apply all actions up to the stepIndex
    // to get the correct board state
  }, [replayGame, isReplayMode]);
  
  const handleExitReplay = useCallback(() => {
    setIsReplayMode(false);
    setReplayGame(null);
    setCurrentReplayStep(0);
    
    // Reset to a fresh board
    dispatch({ 
      type: 'INIT_GAME', 
      payload: {
        rows: settings.rows,
        cols: settings.cols,
        mines: settings.mines
      }
    });
    
    // Create a fresh game board for history
    const newGameBoard = gameService.createBoard(
      settings.rows,
      settings.cols,
      settings.mines
    );
    
    // Start a new game history entry with the fresh board
    const gameId = gameHistoryService.initGameHistory(newGameBoard);
    setCurrentGameId(gameId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.rows, settings.cols, settings.mines]);
  
  // Context value
  const value = useMemo(() => ({
    gameBoard,
    initGame,
    revealCell,
    toggleFlag,
    chordCell,
    startGame,
    restartGame,
    gameHistory,
    currentGameId,
    isReplayMode,
    replayGame: handleReplayGame,
    replayStep: handleReplayStep,
    currentReplayStep,
    totalReplaySteps: replayGame?.actions.length || 0,
    exitReplay: handleExitReplay
  }), [
    gameBoard, 
    initGame, 
    revealCell, 
    toggleFlag, 
    chordCell, 
    startGame, 
    restartGame,
    gameHistory,
    currentGameId,
    isReplayMode,
    handleReplayGame,
    handleReplayStep,
    currentReplayStep,
    replayGame,
    handleExitReplay
  ]);
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 