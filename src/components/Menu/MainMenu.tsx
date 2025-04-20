import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  VStack,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { FaCog, FaMedal, FaGamepad, FaHistory } from 'react-icons/fa';
import DifficultySelector from './DifficultySelector';
import SettingsPanel from './SettingsPanel';
import { GameContext } from '../../context/GameContext';
import { SettingsContext } from '../../context/SettingsContext';
import HighScores from '../Scores/HighScores';
import GameHistory from '../History/GameHistory';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const { restartGame } = useContext(GameContext);
  const { settings } = useContext(SettingsContext);
  
  // For settings modal
  const { 
    isOpen: isSettingsOpen, 
    onOpen: onSettingsOpen, 
    onClose: onSettingsClose 
  } = useDisclosure();
  
  // For scores modal
  const { 
    isOpen: isScoresOpen, 
    onOpen: onScoresOpen, 
    onClose: onScoresClose 
  } = useDisclosure();
  
  // For history modal
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose
  } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Combined function to both restart game and start playing
  const handlePlayClick = () => {
    restartGame();
    onStartGame(); // This will hide the menu and show the game
  };
  
  return (
    <Box
      p={5}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={borderColor}
      maxW="500px"
      width="100%"
      mx="auto"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" mb={2}>
          Minesweeper
        </Heading>
        
        {/* Game difficulty options */}
        <DifficultySelector />
        
        {/* Game control buttons */}
        <Flex justify="center" wrap="wrap" gap={4}>
          <Button
            leftIcon={<FaGamepad />}
            colorScheme="blue"
            size="lg"
            onClick={handlePlayClick}
            width={["100%", "auto"]}
          >
            Play
          </Button>
          
          <Button
            leftIcon={<FaMedal />}
            colorScheme="green"
            size="lg"
            onClick={onScoresOpen}
            width={["100%", "auto"]}
          >
            High Scores
          </Button>
          
          <Button
            leftIcon={<FaHistory />}
            colorScheme="teal"
            size="lg"
            onClick={onHistoryOpen}
            width={["100%", "auto"]}
          >
            Game History
          </Button>
          
          <Button
            leftIcon={<FaCog />}
            colorScheme="purple"
            size="lg"
            onClick={onSettingsOpen}
            width={["100%", "auto"]}
          >
            Settings
          </Button>
        </Flex>
      </VStack>
      
      {/* Settings Modal */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={onSettingsClose} />
      
      {/* High Scores Modal */}
      <HighScores isOpen={isScoresOpen} onClose={onScoresClose} />
      
      {/* Game History Modal */}
      <GameHistory isOpen={isHistoryOpen} onClose={onHistoryClose} />
    </Box>
  );
};

export default MainMenu; 