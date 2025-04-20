import { CellState, Difficulty, GameBoard, GameStatus, Position } from '../types/game.types';

/**
 * Creates a new game board based on dimensions and mine count
 */
export const createBoard = (rows: number, cols: number, mines: number): GameBoard => {
  // Initialize empty board with all cells hidden
  const board: CellState[][] = Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      revealed: false,
      isMine: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    
    // Skip if there's already a mine here
    if (board[row][col].isMine) continue;
    
    board[row][col].isMine = true;
    minesPlaced++;
  }

  // Calculate adjacent mines for each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].isMine) continue;
      
      let adjacentMines = 0;
      
      // Check all 8 neighboring cells
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r === row && c === col) continue;
          if (board[r][c].isMine) adjacentMines++;
        }
      }
      
      board[row][col].adjacentMines = adjacentMines;
    }
  }

  return {
    cells: board,
    rows,
    cols,
    mines,
    minesRemaining: mines,
    status: GameStatus.READY,
    startTime: null,
    endTime: null,
  };
};

/**
 * Creates a game board with predefined mine positions
 * Used for replaying games to ensure the same board is used
 */
export const createBoardWithMines = (rows: number, cols: number, mines: number, minePositions: Position[]): GameBoard => {
  // Initialize empty board with all cells hidden
  const board: CellState[][] = Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      revealed: false,
      isMine: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  );

  // Place mines at the specified positions
  minePositions.forEach(pos => {
    if (pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols) {
      board[pos.row][pos.col].isMine = true;
    }
  });

  // Calculate adjacent mines for each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].isMine) continue;
      
      let adjacentMines = 0;
      
      // Check all 8 neighboring cells
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r === row && c === col) continue;
          if (board[r][c].isMine) adjacentMines++;
        }
      }
      
      board[row][col].adjacentMines = adjacentMines;
    }
  }

  return {
    cells: board,
    rows,
    cols,
    mines,
    minesRemaining: mines,
    status: GameStatus.READY,
    startTime: null,
    endTime: null,
  };
};

/**
 * Get predefined dimensions based on difficulty level
 */
export const getDifficultySettings = (difficulty: Difficulty): { rows: number, cols: number, mines: number } => {
  switch (difficulty) {
    case Difficulty.BEGINNER:
      return { rows: 9, cols: 9, mines: 10 };
    case Difficulty.INTERMEDIATE:
      return { rows: 16, cols: 16, mines: 40 };
    case Difficulty.EXPERT:
      return { rows: 16, cols: 30, mines: 99 };
    default:
      return { rows: 9, cols: 9, mines: 10 };
  }
};

/**
 * Reveal a cell and handle cascading reveal for empty cells
 */
export const revealCell = (board: GameBoard, position: Position): GameBoard => {
  const { row, col } = position;
  const { cells, rows, cols } = board;
  
  // Skip if cell is already revealed or flagged
  if (cells[row][col].revealed || cells[row][col].isFlagged) {
    return board;
  }
  
  // Clone the board to avoid mutating the original
  const newCells = JSON.parse(JSON.stringify(cells));
  
  // Reveal the clicked cell
  newCells[row][col].revealed = true;
  
  // If it's a mine, game over
  if (newCells[row][col].isMine) {
    return {
      ...board,
      cells: newCells,
      status: GameStatus.LOST,
      endTime: Date.now(),
    };
  }
  
  // If it's an empty cell, reveal adjacent cells recursively
  if (newCells[row][col].adjacentMines === 0) {
    const revealAdjacent = (r: number, c: number) => {
      for (let i = Math.max(0, r - 1); i <= Math.min(rows - 1, r + 1); i++) {
        for (let j = Math.max(0, c - 1); j <= Math.min(cols - 1, c + 1); j++) {
          if (i === r && j === c) continue;
          if (!newCells[i][j].revealed && !newCells[i][j].isFlagged) {
            newCells[i][j].revealed = true;
            if (newCells[i][j].adjacentMines === 0) {
              revealAdjacent(i, j);
            }
          }
        }
      }
    };
    
    revealAdjacent(row, col);
  }
  
  // Check if the game is won
  const isGameWon = checkWinCondition(newCells, board.mines);
  
  return {
    ...board,
    cells: newCells,
    status: isGameWon ? GameStatus.WON : board.status,
    endTime: isGameWon ? Date.now() : board.endTime,
  };
};

/**
 * Toggle a flag on a cell
 */
export const toggleFlag = (board: GameBoard, position: Position): GameBoard => {
  const { row, col } = position;
  const { cells, minesRemaining } = board;
  
  // Skip if cell is already revealed
  if (cells[row][col].revealed) {
    return board;
  }
  
  // Clone the board to avoid mutating the original
  const newCells = JSON.parse(JSON.stringify(cells));
  
  // Toggle the flag
  newCells[row][col].isFlagged = !newCells[row][col].isFlagged;
  
  // Update mines remaining count
  const newMinesRemaining = newCells[row][col].isFlagged ? 
    minesRemaining - 1 : minesRemaining + 1;
  
  return {
    ...board,
    cells: newCells,
    minesRemaining: newMinesRemaining,
  };
};

/**
 * Check if the game is won
 */
const checkWinCondition = (cells: CellState[][], totalMines: number): boolean => {
  let revealedCount = 0;
  let totalCells = 0;
  
  for (const row of cells) {
    for (const cell of row) {
      totalCells++;
      if (cell.revealed) {
        revealedCount++;
      }
    }
  }
  
  // Game is won if all non-mine cells are revealed
  return revealedCount === totalCells - totalMines;
};

/**
 * Start the game timer
 */
export const startGame = (board: GameBoard): GameBoard => {
  if (board.status === GameStatus.READY) {
    return {
      ...board,
      status: GameStatus.PLAYING,
      startTime: Date.now(),
    };
  }
  return board;
};

/**
 * Reveal all mines when game is lost
 */
export const revealAllMines = (board: GameBoard): GameBoard => {
  const newCells = JSON.parse(JSON.stringify(board.cells));
  
  for (let row = 0; row < board.rows; row++) {
    for (let col = 0; col < board.cols; col++) {
      if (newCells[row][col].isMine) {
        newCells[row][col].revealed = true;
      }
    }
  }
  
  return {
    ...board,
    cells: newCells,
  };
};

/**
 * Perform a chord action on a cell - reveal adjacent cells if the correct number of flags are placed
 */
export const chordCell = (board: GameBoard, position: Position): GameBoard => {
  const { row, col } = position;
  const { cells, rows, cols } = board;
  const cell = cells[row][col];
  
  // Skip if cell is not revealed or has no adjacent mines
  if (!cell.revealed || cell.adjacentMines === 0) {
    return board;
  }
  
  // Count adjacent flags
  let adjacentFlags = 0;
  const adjacentPositions: Position[] = [];
  
  for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
      if (r === row && c === col) continue;
      
      if (cells[r][c].isFlagged) {
        adjacentFlags++;
      } else if (!cells[r][c].revealed) {
        // Add non-revealed, non-flagged cells to the list to reveal
        adjacentPositions.push({ row: r, col: c });
      }
    }
  }
  
  // If the number of adjacent flags matches the cell's number, reveal adjacent cells
  if (adjacentFlags === cell.adjacentMines) {
    let newBoard = { ...board };
    
    // Reveal each non-flagged adjacent cell
    for (const pos of adjacentPositions) {
      newBoard = revealCell(newBoard, pos);
      
      // If one of the revealed cells was a mine, game over
      if (newBoard.status === GameStatus.LOST) {
        return newBoard;
      }
    }
    
    return newBoard;
  }
  
  // If the number of flags doesn't match, do nothing
  return board;
}; 