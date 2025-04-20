import React, { useCallback } from 'react';
import { Box, Center, Text, useColorModeValue } from '@chakra-ui/react';
import { CellState, GameMode } from '../../types/game.types';
import { FaBomb, FaFlag } from 'react-icons/fa';

interface CellProps {
  cellState: CellState;
  row: number;
  col: number;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  gameMode: GameMode;
  gameOver: boolean;
  enableAnimations: boolean;
}

const CELL_COLORS = [
  'blue.600',     // 1 adjacent mine
  'green.600',    // 2 adjacent mines
  'red.600',      // 3 adjacent mines
  'purple.700',   // 4 adjacent mines
  'maroon',       // 5 adjacent mines
  'teal.600',     // 6 adjacent mines
  'black',        // 7 adjacent mines
  'gray.500'      // 8 adjacent mines
];

export const Cell: React.FC<CellProps> = ({
  cellState,
  row,
  col,
  onReveal,
  onFlag,
  onChord,
  gameMode,
  gameOver,
  enableAnimations
}) => {
  const { revealed, isMine, isFlagged, adjacentMines } = cellState;
  
  const bgColor = useColorModeValue(
    revealed ? 'gray.200' : 'gray.300',
    revealed ? 'gray.700' : 'gray.600'
  );
  
  const borderColor = useColorModeValue(
    revealed ? 'gray.300' : 'gray.400',
    revealed ? 'gray.600' : 'gray.500'
  );
  
  const handleLeftClick = useCallback(() => {
    if (gameOver) return;
    
    if (revealed && adjacentMines > 0) {
      onChord(row, col);
      return;
    }
    
    if (gameMode === GameMode.BOMB) {
      if (!isFlagged) {
        onReveal(row, col);
      }
    } else {
      if (!revealed) {
        onFlag(row, col);
      }
    }
  }, [row, col, revealed, isFlagged, adjacentMines, gameMode, gameOver, onReveal, onFlag, onChord]);
  
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver) return;
    
    if (revealed && adjacentMines > 0) {
      onChord(row, col);
      return;
    }
    
    if (gameMode === GameMode.BOMB) {
      if (!revealed) {
        onFlag(row, col);
      }
    } else {
      if (!isFlagged) {
        onReveal(row, col);
      }
    }
  }, [row, col, revealed, isFlagged, adjacentMines, gameMode, gameOver, onReveal, onFlag, onChord]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);
  
  return (
    <Box
      width="30px"
      height="30px"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="sm"
      boxShadow={!revealed ? 'md' : 'none'}
      transition={enableAnimations ? 'all 0.2s' : 'none'}
      _hover={{ opacity: gameOver ? 1 : 0.8 }}
      onClick={handleLeftClick}
      onContextMenu={handleContextMenu}
      onMouseDown={(e) => e.button === 2 && handleRightClick(e)}
      cursor={gameOver ? 'default' : 'pointer'}
    >
      <Center h="100%">
        {revealed && isMine && (
          <FaBomb color="black" />
        )}
        
        {revealed && !isMine && adjacentMines > 0 && (
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={CELL_COLORS[adjacentMines - 1]}
          >
            {adjacentMines}
          </Text>
        )}
        
        {!revealed && isFlagged && (
          <FaFlag color="red" />
        )}
      </Center>
    </Box>
  );
};

export default Cell; 