import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Difficulty, GameBoard, GameStatus, Position, CellState } from '../types/game.types';
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
  refreshGameHistory: () => void;
  replayGameData: gameHistoryService.GameHistoryEntry | null;
  isAIPlaying: boolean;
  setAIPlaying: (isPlaying: boolean) => void;
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
  const [isAIPlaying, setAIPlaying] = useState(false);
  
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
  
  // Save score when game is won and update game history when game is over
  useEffect(() => {
    if (isReplayMode) return; // Don't save during replay
    
    // When game is over (won or lost)
    if ((gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST) && 
        gameBoard.startTime && gameBoard.endTime) {
      
      // First, ensure the game is marked as complete in history
      console.log(`Game over detected: ${gameBoard.status}`);
      
      try {
        // For won games, also save the score
        if (gameBoard.status === GameStatus.WON) {
          const time = gameBoard.endTime - gameBoard.startTime;
          
          const savedScore = storageService.saveScore({
            difficulty: settings.difficulty,
            rows: gameBoard.rows,
            cols: gameBoard.cols,
            mines: gameBoard.mines,
            time,
          });
          
          console.log('Score saved successfully:', savedScore);
        }
        
        // Force a save of the completed game to history
        const currentGame = gameHistoryService.getCurrentGame();
        if (currentGame) {
          // Update the current game status
          currentGame.isComplete = true;
          currentGame.endTime = gameBoard.endTime;
          
          // Explicitly finish the current game and move to history
          gameHistoryService.finishCurrentGame(currentGame);
          console.log('Game explicitly saved to history:', currentGame.id);
          
          // Refresh the game history list
          setTimeout(() => {
            const history = gameHistoryService.getGameHistory();
            console.log(`Loaded ${history.length} games from history after completion`);
            setGameHistory(history);
          }, 100);
        }
      } catch (err) {
        console.error('Error saving game or score:', err);
      }
    }
  }, [gameBoard.status, gameBoard.startTime, gameBoard.endTime, gameBoard.rows, gameBoard.cols, gameBoard.mines, settings.difficulty, isReplayMode]);
  
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
    
    // Only record action if not in AI mode
    if (!isAIPlaying) {
      // Then record the action with a slight delay to ensure the state update happens first
      setTimeout(() => {
        const updatedBoard = gameService.revealCell(gameBoard, position);
        gameHistoryService.recordGameAction('REVEAL', updatedBoard, position);
      }, 0);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard, isAIPlaying]);
  
  const toggleFlag = useCallback((position: Position) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'TOGGLE_FLAG', payload: position });
    
    // Only record action if not in AI mode
    if (!isAIPlaying) {
      // Then record the action with a slight delay to ensure the state update happens first
      setTimeout(() => {
        const updatedBoard = gameService.toggleFlag(gameBoard, position);
        gameHistoryService.recordGameAction('FLAG', updatedBoard, position);
      }, 0);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard, isAIPlaying]);
  
  const chordCell = useCallback((position: Position) => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'CHORD_CELL', payload: position });
    
    // Only record action if not in AI mode
    if (!isAIPlaying) {
      // Then record the action with a slight delay to ensure the state update happens first
      setTimeout(() => {
        const updatedBoard = gameService.chordCell(gameBoard, position);
        gameHistoryService.recordGameAction('CHORD', updatedBoard, position);
      }, 0);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard, isAIPlaying]);
  
  const startGame = useCallback(() => {
    if (isReplayMode) return; // Don't allow actions during replay
    
    // Update the board first
    dispatch({ type: 'START_GAME' });
    
    // Only record action if not in AI mode
    if (!isAIPlaying) {
      // Then record the action with a slight delay to ensure the state update happens first
      setTimeout(() => {
        const updatedBoard = gameService.startGame(gameBoard);
        gameHistoryService.recordGameAction('START', updatedBoard);
      }, 0);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplayMode, gameBoard, isAIPlaying]);
  
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
    
    // Create a fresh board with the original mine positions
    const initialBoard = gameService.createBoardWithMines(
      game.gameBoard.rows,
      game.gameBoard.cols,
      game.gameBoard.mines,
      game.minePositions
    );
    
    // Set the timer state to match the original game's start time
    if (game.startTime) {
      initialBoard.startTime = game.startTime;
    }
    
    // If the game was completed, also set the end time for proper timer display
    if (game.isComplete && game.endTime) {
      initialBoard.endTime = game.endTime;
    }
    
    // Set the initial board state
    dispatch({ type: 'SET_BOARD', payload: initialBoard });
    
    console.log('Started game replay with board:', initialBoard);
  }, []);
  
  /**
   * Replays a specific step of a game
   */
  const handleReplayStep = (stepIndex: number) => {
    if (!replayGame) return; // Use replayGame state, not currentGameId
    
    // Get the game data - we already have it in our state
    const game = replayGame;
    
    console.log(`Replaying step ${stepIndex + 1} of ${game.actions.length}`);
    
    // Get the board state at this step index
    const { gameBoard: replayedBoard, action } = gameHistoryService.getGameSnapshotAtIndex(game, stepIndex);
    
    if (!replayedBoard) {
      console.error('Could not get board state for step:', stepIndex);
      return;
    }
    
    // If this is the last step and the game ended in a completed state, ensure correct status
    const isLastStep = stepIndex === game.actions.length - 1;
    
    if (isLastStep && game.isComplete) {
      // Explicitly set the game status based on the original game outcome
      replayedBoard.status = game.gameBoard.status;
      
      // Make sure end time is set for completed games
      if (game.endTime && !replayedBoard.endTime) {
        replayedBoard.endTime = game.endTime;
      }
      
      // For lost games, ensure all mines are revealed
      if (game.gameBoard.status === GameStatus.LOST) {
        // First, make sure all mines are revealed
        replayedBoard.cells = replayedBoard.cells.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            // Keep flags as is, but reveal mines
            if (cell.isMine) {
              return {
                ...cell,
                revealed: true
              };
            }
            return cell;
          })
        );
        
        // If the final action was clicking a mine, ensure it's revealed and highlighted
        if (action?.type === 'REVEAL' && action.position) {
          const { row, col } = action.position;
          if (replayedBoard.cells[row][col].isMine) {
            // Make sure this specific mine is explicitly revealed
            replayedBoard.cells[row][col].revealed = true;
          }
        }
      }
      
      // For won games, ensure the status is explicitly set
      if (game.gameBoard.status === GameStatus.WON) {
        replayedBoard.status = GameStatus.WON;
      }
    }
    
    // Update the current replay step
    setCurrentReplayStep(stepIndex);
    
    // Update the board
    dispatch({ type: 'SET_BOARD', payload: replayedBoard });
    
    console.log('Current replay step:', stepIndex, 'Status:', replayedBoard.status);
  };
  
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
  
  // Explicitly refresh game history
  const refreshGameHistory = useCallback(() => {
    const history = gameHistoryService.getGameHistory();
    console.log(`Refreshed game history, found ${history.length} games`);
    setGameHistory(history);
  }, []);
  
  // Auto-refresh history periodically and on mount
  useEffect(() => {
    // Initial load
    refreshGameHistory();
    
    // Refresh on an interval
    const refreshInterval = setInterval(() => {
      if (!isReplayMode) {
        refreshGameHistory();
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(refreshInterval);
  }, [refreshGameHistory, isReplayMode]);
  
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
    exitReplay: handleExitReplay,
    refreshGameHistory,
    replayGameData: replayGame,
    isAIPlaying,
    setAIPlaying
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
    handleExitReplay,
    refreshGameHistory,
    isAIPlaying,
    setAIPlaying
  ]);
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 