import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, SimpleGrid, useToast } from '@chakra-ui/react';
import Cell from './Cell';
import { GameStatus, Position } from '../../types/game.types';
import { GameContext } from '../../context/GameContext';
import { SettingsContext } from '../../context/SettingsContext';
import GameOverModal from './GameOverModal';

interface BoardProps {
  onReturnToMenu: () => void;
}

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
  
  const gameOver = gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST;
  
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
      <Box
        maxW="100%"
        overflowX="auto"
        p={4}
        bg={gameOver ? (gameBoard.status === GameStatus.WON ? 'green.50' : 'red.50') : 'transparent'}
        borderRadius="md"
        transition={settings.enableAnimations ? 'all 0.3s' : 'none'}
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
              />
            ))
          )}
        </SimpleGrid>
      </Box>
      
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