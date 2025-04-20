import React, { useContext } from 'react';
import { Box, Flex, HStack, Text, useColorModeValue, IconButton, Tooltip } from '@chakra-ui/react';
import { FaBomb, FaClock, FaFlag } from 'react-icons/fa';
import { GameContext } from '../../context/GameContext';
import { SettingsContext } from '../../context/SettingsContext';
import Timer from './Timer';
import { GameMode, GameStatus } from '../../types/game.types';

const GameInfo: React.FC = () => {
  const { gameBoard } = useContext(GameContext);
  const { settings, updateSettings } = useContext(SettingsContext);
  
  const bgColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const activeBgColor = useColorModeValue('blue.100', 'blue.800');
  
  const isGameActive = gameBoard.status === GameStatus.PLAYING || 
                       gameBoard.status === GameStatus.WON || 
                       gameBoard.status === GameStatus.LOST;
  
  const toggleGameMode = () => {
    const newMode = settings.gameMode === GameMode.BOMB ? GameMode.FLAG : GameMode.BOMB;
    updateSettings({ gameMode: newMode });
  };
  
  return (
    <Flex
      justify="space-between"
      align="center"
      w="100%"
      mb={4}
      p={3}
      bg={bgColor}
      borderRadius="md"
      boxShadow="md"
    >
      {/* Mine counter */}
      <HStack spacing={2}>
        <FaBomb />
        <Text fontWeight="bold" color={textColor}>
          {gameBoard.minesRemaining}
        </Text>
      </HStack>
      
      {/* Game Mode Toggle */}
      <HStack>
        <Tooltip label={`Current mode: ${settings.gameMode === GameMode.BOMB ? 'Bomb' : 'Flag'} Mode`}>
          <IconButton
            aria-label="Toggle Game Mode"
            icon={settings.gameMode === GameMode.BOMB ? <FaBomb /> : <FaFlag />}
            size="sm"
            colorScheme={settings.gameMode === GameMode.BOMB ? "red" : "blue"}
            onClick={toggleGameMode}
            isDisabled={gameBoard.status === GameStatus.LOST || gameBoard.status === GameStatus.WON}
          />
        </Tooltip>
        <Text fontSize="sm" color={textColor} display={{ base: 'none', md: 'block' }}>
          {settings.gameMode === GameMode.BOMB ? 'Bomb Mode' : 'Flag Mode'}
        </Text>
      </HStack>
      
      {/* Difficulty level */}
      <Box>
        <Text fontWeight="bold" color={textColor} textTransform="capitalize">
          {settings.difficulty}
        </Text>
      </Box>
      
      {/* Timer */}
      {settings.showTimer && (
        <HStack spacing={2}>
          <FaClock />
          <Timer 
            isRunning={gameBoard.status === GameStatus.PLAYING}
            startTime={gameBoard.startTime}
            endTime={gameBoard.endTime}
          />
        </HStack>
      )}
    </Flex>
  );
};

export default GameInfo; 