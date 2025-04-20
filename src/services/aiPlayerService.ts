import { GameBoard, Position, GameStatus, CellState } from '../types/game.types';

// Probability model for the AI
interface CellProbability {
  position: Position;
  probability: number; // 0-1 where 1 means 100% chance of mine
  isSafe: boolean;     // True if known to be safe
  isMine: boolean;     // True if known to be a mine
}

/**
 * AI Player Service for Minesweeper
 * Implements a human-like strategy for solving Minesweeper puzzles
 */

/**
 * Get a random position on the board that hasn't been revealed yet
 */
const getRandomUnrevealedPosition = (board: GameBoard): Position | null => {
  const unrevealedPositions: Position[] = [];
  
  // Find all unrevealed and unflagged cells
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const cell = board.cells[row][col];
      if (!cell.revealed && !cell.isFlagged) {
        unrevealedPositions.push({ row, col });
      }
    }
  }
  
  if (unrevealedPositions.length === 0) return null;
  
  // Choose a random position
  const randomIndex = Math.floor(Math.random() * unrevealedPositions.length);
  return unrevealedPositions[randomIndex];
}

/**
 * Get all neighbors of a cell
 */
const getNeighbors = (board: GameBoard, position: Position): Position[] => {
  const { row, col } = position;
  const neighbors: Position[] = [];
  
  for (let r = Math.max(0, row - 1); r <= Math.min(board.rows - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(board.cols - 1, col + 1); c++) {
      if (r !== row || c !== col) {
        neighbors.push({ row: r, col: c });
      }
    }
  }
  
  return neighbors;
}

/**
 * Get all unrevealed neighbors
 */
const getUnrevealedNeighbors = (board: GameBoard, position: Position): Position[] => {
  const neighbors = getNeighbors(board, position);
  return neighbors.filter(pos => {
    const cell = board.cells[pos.row][pos.col];
    return !cell.revealed;
  });
}

/**
 * Get all flagged neighbors
 */
const getFlaggedNeighbors = (board: GameBoard, position: Position): Position[] => {
  const neighbors = getNeighbors(board, position);
  return neighbors.filter(pos => {
    const cell = board.cells[pos.row][pos.col];
    return cell.isFlagged;
  });
}

/**
 * Check if a cell can be safely revealed
 * If a revealed cell has exactly the right number of flagged neighbors,
 * the remaining neighbors are safe
 */
const findSafeCells = (board: GameBoard): Position[] => {
  const safeCells: Position[] = [];
  
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const cell = board.cells[row][col];
      
      // Skip cells that aren't revealed or have no adjacent mines
      if (!cell.revealed || cell.adjacentMines === 0) continue;
      
      const position = { row, col };
      const flaggedNeighbors = getFlaggedNeighbors(board, position);
      const unrevealedNeighbors = getUnrevealedNeighbors(board, position);
      
      // If the number of flagged neighbors matches the number of adjacent mines,
      // then all unrevealed neighbors are safe to reveal
      if (flaggedNeighbors.length === cell.adjacentMines && unrevealedNeighbors.length > 0) {
        // Filter out flagged cells from unrevealed neighbors
        const unflaggedUnrevealed = unrevealedNeighbors.filter(pos => {
          const neighborCell = board.cells[pos.row][pos.col];
          return !neighborCell.isFlagged;
        });
        
        safeCells.push(...unflaggedUnrevealed);
      }
    }
  }
  
  return safeCells;
}

/**
 * Find cells that definitely contain mines
 * If a revealed cell has exactly the right number of unrevealed neighbors,
 * all of them must be mines
 */
const findDefiniteMines = (board: GameBoard): Position[] => {
  const mineCells: Position[] = [];
  
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      const cell = board.cells[row][col];
      
      // Skip cells that aren't revealed or have no adjacent mines
      if (!cell.revealed || cell.adjacentMines === 0) continue;
      
      const position = { row, col };
      const flaggedNeighbors = getFlaggedNeighbors(board, position);
      const unrevealedNeighbors = getUnrevealedNeighbors(board, position);
      
      // If the number of unrevealed neighbors equals the number of adjacent mines
      // minus already flagged neighbors, then all unflagged unrevealed neighbors are mines
      const remainingMines = cell.adjacentMines - flaggedNeighbors.length;
      const unflaggedUnrevealed = unrevealedNeighbors.filter(pos => {
        const neighborCell = board.cells[pos.row][pos.col];
        return !neighborCell.isFlagged;
      });
      
      if (remainingMines > 0 && unflaggedUnrevealed.length === remainingMines) {
        mineCells.push(...unflaggedUnrevealed);
      }
    }
  }
  
  return mineCells;
}

/**
 * Using more advanced probability calculations to determine the best move
 * This is a simplified version of what a human might do
 */
const calculateBestGuess = (board: GameBoard): Position | null => {
  // If this is the first move, pick a random cell
  const anyRevealed = board.cells.some(row => row.some(cell => cell.revealed));
  if (!anyRevealed) {
    // For first move, prefer corners or center for better opening
    const options: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: board.cols - 1 },
      { row: board.rows - 1, col: 0 },
      { row: board.rows - 1, col: board.cols - 1 },
      { row: Math.floor(board.rows / 2), col: Math.floor(board.cols / 2) }
    ];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  // Collect all potential moves with their probabilities
  const probabilities: CellProbability[] = [];
  
  // First, get all the safe moves
  const safeCells = findSafeCells(board);
  if (safeCells.length > 0) {
    // Return a random safe cell
    return safeCells[Math.floor(Math.random() * safeCells.length)];
  }
  
  // If no safe moves, just make a random guess for now
  // In a more advanced implementation, we would calculate actual probabilities
  return getRandomUnrevealedPosition(board);
}

/**
 * Determine the next move for the AI
 * Returns either a cell to reveal or a cell to flag
 */
export const getNextMove = (board: GameBoard): { type: 'reveal' | 'flag', position: Position } | null => {
  if (board.status !== GameStatus.PLAYING && board.status !== GameStatus.READY) {
    return null; // Game is not active
  }
  
  // First, check if there are any safe cells to reveal
  const safeCells = findSafeCells(board);
  if (safeCells.length > 0) {
    // Reveal a random safe cell
    const position = safeCells[Math.floor(Math.random() * safeCells.length)];
    return { type: 'reveal', position };
  }
  
  // Next, check if there are definite mines to flag
  const mineCells = findDefiniteMines(board);
  if (mineCells.length > 0) {
    // Flag a random mine cell
    const position = mineCells[Math.floor(Math.random() * mineCells.length)];
    return { type: 'flag', position };
  }
  
  // If neither, make a best guess based on probability
  const bestGuess = calculateBestGuess(board);
  if (bestGuess) {
    return { type: 'reveal', position: bestGuess };
  }
  
  return null; // No move found
}

/**
 * AI Player config
 */
export interface AIPlayerConfig {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast'; // Speed of moves
  autoRestart: boolean; // Whether to automatically restart after game over
}

/**
 * Default AI player configuration
 */
export const DEFAULT_AI_CONFIG: AIPlayerConfig = {
  enabled: false,
  speed: 'medium',
  autoRestart: false
};

/**
 * Get delay between moves based on speed setting
 */
export const getMoveDelay = (speed: AIPlayerConfig['speed']): number => {
  switch (speed) {
    case 'slow': return 1200;
    case 'medium': return 700;
    case 'fast': return 300;
    default: return 700;
  }
}; 