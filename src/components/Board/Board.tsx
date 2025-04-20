import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { Box, SimpleGrid, useToast, useBreakpointValue, VStack } from '@chakra-ui/react';
import Cell from './Cell';
import BoardControls from './BoardControls';
import { GameStatus, Position } from '../../types/game.types';
import { GameContext } from '../../context/GameContext';
import { SettingsContext } from '../../context/SettingsContext';
import GameOverModal from './GameOverModal';

interface BoardProps {
  onReturnToMenu: () => void;
}

// Cell size constants
const MIN_CELL_SIZE = 16;
const MAX_CELL_SIZE = 50;
const DEFAULT_CELL_SIZE = 30;

const Board: React.FC<BoardProps> = ({ onReturnToMenu }) => {
  const { 
    gameBoard, 
    revealCell: revealCellAction, 
    toggleFlag: toggleFlagAction,
    chordCell: chordCellAction,
    startGame: startGameAction,
    restartGame: restartGameAction
  } = useContext(GameContext);
  
  const { settings } = useContext(SettingsContext);
  const toast = useToast();
  
  // State for tracking game over modal
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  // State and refs for responsive board sizing
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [idealCellSize, setIdealCellSize] = useState(DEFAULT_CELL_SIZE);
  
  const gameOver = gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST;
  
  // Different default sizes based on screen size
  const defaultSize = useBreakpointValue({
    base: 24, // Mobile
    sm: 26,   // Small screens
    md: 28,   // Medium screens
    lg: 30    // Large screens
  }) || DEFAULT_CELL_SIZE;
  
  // Calculate ideal cell size based on container size and board dimensions
  useEffect(() => {
    const calculateIdealCellSize = () => {
      if (!boardContainerRef.current) return;
      
      const containerWidth = boardContainerRef.current.clientWidth;
      const containerHeight = window.innerHeight * 0.6; // Use 60% of viewport height as max
      
      // Calculate maximum cell size that would fit
      const maxWidthCellSize = Math.floor((containerWidth - (gameBoard.cols - 1)) / gameBoard.cols);
      const maxHeightCellSize = Math.floor((containerHeight - (gameBoard.rows - 1)) / gameBoard.rows);
      
      // Use the smaller of the two dimensions
      let newSize = Math.min(maxWidthCellSize, maxHeightCellSize);
      
      // Clamp between min and max
      newSize = Math.max(MIN_CELL_SIZE, Math.min(newSize, MAX_CELL_SIZE));
      
      setIdealCellSize(newSize);
      setCellSize(newSize);
    };
    
    // Calculate on mount and when dimensions change
    calculateIdealCellSize();
    
    // Add resize listener
    const handleResize = () => {
      calculateIdealCellSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameBoard.rows, gameBoard.cols]);
  
  // Reset zoom to ideal size
  const resetZoom = () => {
    setCellSize(idealCellSize);
  };
  
  // Show modal when game is over
  useEffect(() => {
    if (gameOver) {
      // Give a short delay to show the board state before showing the modal
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [gameOver]);
  
  // Handle revealing a cell
  const handleReveal = useCallback((row: number, col: number) => {
    const position: Position = { row, col };
    
    // Start the game on the first cell reveal
    if (gameBoard.status === GameStatus.READY) {
      startGameAction();
    }
    
    revealCellAction(position);
  }, [revealCellAction, gameBoard.status, startGameAction]);
  
  // Handle flagging a cell
  const handleFlag = useCallback((row: number, col: number) => {
    const position: Position = { row, col };
    
    // Start the game on the first flag
    if (gameBoard.status === GameStatus.READY) {
      startGameAction();
    }
    
    toggleFlagAction(position);
  }, [toggleFlagAction, gameBoard.status, startGameAction]);
  
  // Handle chord action
  const handleChord = useCallback((row: number, col: number) => {
    const position: Position = { row, col };
    
    // Only chord if the game is active
    if (gameBoard.status === GameStatus.PLAYING) {
      chordCellAction(position);
    }
  }, [chordCellAction, gameBoard.status]);
  
  // Handle restart from game over
  const handleRestart = useCallback(() => {
    restartGameAction();
    setShowGameOverModal(false);
  }, [restartGameAction]);
  
  // Show toast when game is won or lost
  useEffect(() => {
    if (gameBoard.status === GameStatus.WON) {
      toast({
        title: 'You win!',
        description: 'Congratulations, you found all the mines!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else if (gameBoard.status === GameStatus.LOST) {
      toast({
        title: 'Game over!',
        description: 'You clicked on a mine!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [gameBoard.status, toast]);
  
  return (
    <>
      <VStack spacing={2} align="stretch">
        <Box
          ref={boardContainerRef}
          maxW="100%"
          overflowX="auto"
          overflowY="auto"
          p={4}
          bg={gameOver ? (gameBoard.status === GameStatus.WON ? 'green.50' : 'red.50') : 'transparent'}
          borderRadius="md"
          transition={settings.enableAnimations ? 'all 0.3s' : 'none'}
          position="relative"
          maxHeight="calc(80vh - 120px)" // Limit height to prevent excessive scrolling
        >
          <SimpleGrid
            columns={gameBoard.cols}
            spacing={1}
            width="fit-content"
            mx="auto"
          >
            {gameBoard.cells.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  cellState={cell}
                  row={rowIndex}
                  col={colIndex}
                  onReveal={handleReveal}
                  onFlag={handleFlag}
                  onChord={handleChord}
                  gameMode={settings.gameMode}
                  gameOver={gameOver}
                  enableAnimations={settings.enableAnimations}
                  size={cellSize}
                />
              ))
            )}
          </SimpleGrid>
        </Box>
        
        {/* Zoom controls - now placed below the board */}
        <BoardControls
          cellSize={cellSize}
          onCellSizeChange={setCellSize}
          resetZoom={resetZoom}
          minSize={MIN_CELL_SIZE}
          maxSize={MAX_CELL_SIZE}
        />
      </VStack>
      
      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOverModal}
        status={gameBoard.status}
        difficulty={settings.difficulty}
        time={gameBoard.startTime && gameBoard.endTime ? gameBoard.endTime - gameBoard.startTime : null}
        onRestart={handleRestart}
        onMainMenu={onReturnToMenu}
      />
    </>
  );
};

export default Board; 