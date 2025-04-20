import { CellState, GameBoard, GameStatus, Position } from '../types/game.types';

// Storage keys
const GAME_HISTORY_KEY = 'minesweeper_game_history';
const CURRENT_GAME_KEY = 'minesweeper_current_game';

// Types for history
export interface GameAction {
  type: 'REVEAL' | 'FLAG' | 'CHORD' | 'START' | 'RESTART';
  position?: Position;
  timestamp: number;
}

export interface GameHistoryEntry {
  id: string;
  gameBoard: GameBoard;
  actions: GameAction[];
  startTime: number;
  endTime: number | null;
  isComplete: boolean;
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
    
    const historyEntry: GameHistoryEntry = {
      id: gameId,
      gameBoard: clonedBoard,
      actions: [],
      startTime: Date.now(),
      endTime: null,
      isComplete: false
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
    
    // Add action to history
    const action: GameAction = {
      type,
      position,
      timestamp: Date.now()
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
    
    return JSON.parse(gameJson);
  } catch (error) {
    console.error('Error getting current game from localStorage:', error);
    return null;
  }
};

/**
 * Finish current game and move to history
 */
const finishCurrentGame = (game: GameHistoryEntry): void => {
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
    console.log(`Retrieved ${history.length} games from history`);
    return history;
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
 * Get a snapshot of the game board at a specific action index
 */
export const getGameSnapshotAtIndex = (
  game: GameHistoryEntry, 
  actionIndex: number
): {gameBoard: GameBoard, action: GameAction | null} => {
  try {
    if (actionIndex < 0 || !game) {
      return {gameBoard: game.gameBoard, action: null};
    }
    
    if (actionIndex >= game.actions.length) {
      actionIndex = game.actions.length - 1;
    }
    
    // We should actually recreate the game state by replaying the actions
    // This would require the game service to help us reconstruct the state
    // For now, we'll just return the initial board and the action
    
    return {
      gameBoard: game.gameBoard,
      action: game.actions[actionIndex]
    };
  } catch (error) {
    console.error('Error getting game snapshot:', error);
    return {gameBoard: game.gameBoard, action: null};
  }
}; 