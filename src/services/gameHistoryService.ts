import { CellState, GameBoard, GameStatus, Position } from '../types/game.types';
import * as gameService from './gameService';

// Storage keys
const GAME_HISTORY_KEY = 'minesweeper_game_history';
const CURRENT_GAME_KEY = 'minesweeper_current_game';

// Types for history
export interface GameAction {
  type: 'REVEAL' | 'FLAG' | 'CHORD' | 'START' | 'RESTART';
  position?: Position;
  timestamp: number;
  boardState?: GameBoard;
}

export interface GameHistoryEntry {
  id: string;
  gameBoard: GameBoard;
  actions: GameAction[];
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
  minePositions: Position[]; // Store the original mine positions for accurate replay
}

// Utility function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

/**
 * Extract mine positions from a game board
 */
const extractMinePositions = (board: GameBoard): Position[] => {
  const minePositions: Position[] = [];
  
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (board.cells[row][col].isMine) {
        minePositions.push({ row, col });
      }
    }
  }
  
  return minePositions;
};

/**
 * Initialize a new game history entry
 */
export const initGameHistory = (gameBoard: GameBoard): string => {
  try {
    const gameId = Date.now().toString();
    
    let clonedBoard: GameBoard;
    try {
      // Use structured clone if available (modern browsers)
      clonedBoard = structuredClone(gameBoard);
    } catch (err) {
      // Fallback to JSON parse/stringify for older browsers
      clonedBoard = JSON.parse(JSON.stringify(gameBoard));
    }
    
    // Extract mine positions for replay
    const minePositions = extractMinePositions(gameBoard);
    
    const historyEntry: GameHistoryEntry = {
      id: gameId,
      gameBoard: clonedBoard,
      actions: [],
      startTime: Date.now(),
      endTime: null,
      isComplete: false,
      minePositions // Store mine positions
    };
    
    // Save to local storage
    saveCurrentGame(historyEntry);
    console.log('Game history initialized:', gameId);
    
    return gameId;
  } catch (error) {
    console.error('Error initializing game history:', error);
    return Date.now().toString(); // Return a valid ID even if there's an error
  }
};

/**
 * Record an action in the current game history
 */
export const recordGameAction = (
  type: GameAction['type'], 
  gameBoard: GameBoard,
  position?: Position
): void => {
  try {
    // Get current game
    const currentGame = getCurrentGame();
    if (!currentGame) {
      console.warn('No current game found, action not recorded');
      return;
    }
    
    // Clone the current board state to capture exact state after this action
    let boardSnapshot: GameBoard;
    try {
      // Use structured clone if available
      boardSnapshot = structuredClone(gameBoard);
    } catch (err) {
      // Fallback to JSON for older browsers
      boardSnapshot = JSON.parse(JSON.stringify(gameBoard));
    }
    
    // Add action to history with the current board state
    const action: GameAction = {
      type,
      position,
      timestamp: Date.now(),
      boardState: boardSnapshot // Store the exact board state after this action
    };
    
    currentGame.actions.push(action);
    
    // If game is won or lost, mark as complete
    if (gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST) {
      currentGame.isComplete = true;
      currentGame.endTime = gameBoard.endTime || Date.now();
      
      // Move from current game to history
      finishCurrentGame(currentGame);
      console.log(`Game completed and saved to history (${gameBoard.status})`);
    } else {
      // Update current game in storage
      saveCurrentGame(currentGame);
      console.log(`Action ${type} recorded at position:`, position);
    }
  } catch (error) {
    console.error('Error recording game action:', error);
  }
};

/**
 * Save current game to local storage
 */
const saveCurrentGame = (game: GameHistoryEntry): void => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, current game not saved');
      return;
    }
    localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
  } catch (error) {
    console.error('Error saving current game to localStorage:', error);
  }
};

/**
 * Ensure compatibility with older saved games 
 * by adding mine positions if they're missing
 */
const ensureGameHistoryCompatibility = (game: GameHistoryEntry): GameHistoryEntry => {
  // Check if minePositions is missing (older save format)
  if (!game.minePositions || !Array.isArray(game.minePositions) || game.minePositions.length === 0) {
    console.log(`Migrating older game format: ${game.id}`);
    
    // Extract mine positions from the initial board
    game.minePositions = extractMinePositions(game.gameBoard);
    console.log(`Extracted ${game.minePositions.length} mine positions`);
  }
  
  return game;
};

/**
 * Get current game from local storage
 */
export const getCurrentGame = (): GameHistoryEntry | null => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, cannot get current game');
      return null;
    }
    
    const gameJson = localStorage.getItem(CURRENT_GAME_KEY);
    if (!gameJson) return null;
    
    const game = JSON.parse(gameJson);
    return ensureGameHistoryCompatibility(game);
  } catch (error) {
    console.error('Error getting current game from localStorage:', error);
    return null;
  }
};

/**
 * Finish current game and move to history
 */
export const finishCurrentGame = (game: GameHistoryEntry): void => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, cannot finish current game');
      return;
    }
    
    // Add to history
    const history = getGameHistory();
    history.unshift(game); // Add to beginning for most recent first
    
    // Limit history to 50 games
    const limitedHistory = history.slice(0, 50);
    
    // Save history
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(limitedHistory));
    localStorage.removeItem(CURRENT_GAME_KEY); // Clear current game
    
    console.log('Game successfully moved to history:', game.id);
  } catch (error) {
    console.error('Error finishing current game:', error);
  }
};

/**
 * Get game history from local storage
 */
export const getGameHistory = (): GameHistoryEntry[] => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, returning empty game history');
      return [];
    }
    
    const historyJson = localStorage.getItem(GAME_HISTORY_KEY);
    if (!historyJson) return [];
    
    const history = JSON.parse(historyJson);
    
    // Ensure all games have mine positions for compatibility
    const updatedHistory = history.map(ensureGameHistoryCompatibility);
    
    console.log(`Retrieved ${updatedHistory.length} games from history`);
    return updatedHistory;
  } catch (error) {
    console.error('Error getting game history from localStorage:', error);
    return [];
  }
};

/**
 * Get a specific game by ID
 */
export const getGameById = (id: string): GameHistoryEntry | null => {
  try {
    const history = getGameHistory();
    return history.find(game => game.id === id) || null;
  } catch (error) {
    console.error('Error getting game by ID:', error);
    return null;
  }
};

/**
 * Clear all game history
 */
export const clearGameHistory = (): void => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, cannot clear game history');
      return;
    }
    
    localStorage.removeItem(GAME_HISTORY_KEY);
    localStorage.removeItem(CURRENT_GAME_KEY);
    console.log('Game history cleared successfully');
  } catch (error) {
    console.error('Error clearing game history:', error);
  }
};

/**
 * Get a snapshot of the game board at a specific action index by retrieving the stored state
 */
export const getGameSnapshotAtIndex = (
  game: GameHistoryEntry, 
  actionIndex: number
): {gameBoard: GameBoard, action: GameAction | null} => {
  try {
    if (!game || actionIndex < 0) {
      return { gameBoard: game?.gameBoard || null as any, action: null };
    }
    
    if (actionIndex >= game.actions.length) {
      actionIndex = game.actions.length - 1;
    }
    
    const action = game.actions[actionIndex];
    
    // If the action has a stored board state, use it
    if (action.boardState) {
      console.log(`Using stored board state for step ${actionIndex + 1}`);
      return {
        gameBoard: action.boardState,
        action: action
      };
    }
    
    // Fallback to the old method of reconstructing the state (for backward compatibility with old saved games)
    console.log(`No stored board state for step ${actionIndex + 1}, reconstructing...`);
    
    // Start with a deep copy of the initial board
    let currentBoard: GameBoard;
    try {
      currentBoard = structuredClone(game.gameBoard);
    } catch (err) {
      // Fallback for older browsers
      currentBoard = JSON.parse(JSON.stringify(game.gameBoard));
    }
    
    // Apply each action up to the desired index
    for (let i = 0; i <= actionIndex; i++) {
      const act = game.actions[i];
      
      switch (act.type) {
        case 'REVEAL':
          if (act.position) {
            currentBoard = gameService.revealCell(currentBoard, act.position);
            
            // Check for game over
            if (currentBoard.status === GameStatus.LOST) {
              currentBoard = gameService.revealAllMines(currentBoard);
            }
          }
          break;
          
        case 'FLAG':
          if (act.position) {
            currentBoard = gameService.toggleFlag(currentBoard, act.position);
          }
          break;
          
        case 'CHORD':
          if (act.position) {
            currentBoard = gameService.chordCell(currentBoard, act.position);
          }
          break;
          
        case 'START':
          currentBoard = gameService.startGame(currentBoard);
          break;
          
        case 'RESTART':
          // For restart, we recreate the board with the SAME mine positions for consistent replay
          currentBoard = gameService.createBoardWithMines(
            currentBoard.rows,
            currentBoard.cols,
            currentBoard.mines,
            game.minePositions
          );
          break;
      }
    }
    
    console.log(`Replayed ${actionIndex + 1} of ${game.actions.length} actions`);
    
    return {
      gameBoard: currentBoard,
      action: action
    };
  } catch (error) {
    console.error('Error getting game snapshot:', error);
    return { gameBoard: game.gameBoard, action: null };
  }
}; 