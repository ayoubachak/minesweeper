import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb, 
  HStack, 
  Badge, 
  IconButton, 
  useToast,
  Tooltip,
  Select,
  useColorModeValue
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaRobot, FaCog, FaRedo, FaStepForward } from 'react-icons/fa';
import { GameContext } from '../../context/GameContext';
import { GameStatus } from '../../types/game.types';
import * as aiPlayerService from '../../services/aiPlayerService';

interface AIPlayerProps {
  onClose: () => void;
}

const AIPlayer: React.FC<AIPlayerProps> = ({ onClose }) => {
  const { 
    gameBoard, 
    revealCell, 
    toggleFlag, 
    startGame,
    restartGame,
    isAIPlaying,
    setAIPlaying
  } = useContext(GameContext);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<aiPlayerService.AIPlayerConfig>({
    ...aiPlayerService.DEFAULT_AI_CONFIG,
    enabled: true
  });
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();
  
  // Styling
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  
  // Set AI playing status when component mounts/unmounts
  useEffect(() => {
    setAIPlaying(true);
    return () => setAIPlaying(false);
  }, [setAIPlaying]);
  
  // Update AI playing status when play/pause state changes
  useEffect(() => {
    setAIPlaying(isPlaying);
  }, [isPlaying, setAIPlaying]);
  
  // Clear timer when unmounting
  useEffect(() => {
    return () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
    };
  }, []);
  
  // Stop AI when game is over
  useEffect(() => {
    if (gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST) {
      setIsPlaying(false);
      
      // Show toast with result
      toast({
        title: gameBoard.status === GameStatus.WON ? 'AI Won!' : 'AI Lost!',
        description: gameBoard.status === GameStatus.WON 
          ? 'The AI successfully cleared the board!'
          : 'The AI clicked on a mine!',
        status: gameBoard.status === GameStatus.WON ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      });
      
      // Auto restart if configured
      if (config.autoRestart) {
        const timer = setTimeout(() => {
          restartGame();
          // Wait a bit before starting the AI again
          setTimeout(() => setIsPlaying(true), 1000);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameBoard.status, config.autoRestart, restartGame, toast]);
  
  // Make AI moves
  useEffect(() => {
    if (!isPlaying || !config.enabled) return;
    
    // Start the game if it's not started
    if (gameBoard.status === GameStatus.READY) {
      startGame();
    }
    
    // Don't make moves if the game is over
    if (gameBoard.status !== GameStatus.PLAYING) return;
    
    // Get the next move from the AI service
    const move = aiPlayerService.getNextMove(gameBoard);
    
    if (move) {
      // Schedule the move with the configured delay
      moveTimerRef.current = setTimeout(() => {
        if (move.type === 'reveal') {
          revealCell(move.position);
        } else {
          toggleFlag(move.position);
        }
      }, aiPlayerService.getMoveDelay(config.speed));
    } else {
      // If no move is available, stop the AI
      setIsPlaying(false);
      toast({
        title: 'AI Stopped',
        description: 'The AI cannot find a valid move',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
    
    return () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
    };
  }, [gameBoard, isPlaying, config, revealCell, toggleFlag, startGame, toast]);
  
  // Toggle AI playing state
  const togglePlaying = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  // Make a single AI move
  const makeSingleMove = useCallback(() => {
    if (gameBoard.status === GameStatus.READY) {
      startGame();
      return;
    }
    
    if (gameBoard.status !== GameStatus.PLAYING) return;
    
    const move = aiPlayerService.getNextMove(gameBoard);
    if (move) {
      if (move.type === 'reveal') {
        revealCell(move.position);
      } else {
        toggleFlag(move.position);
      }
    }
  }, [gameBoard, revealCell, toggleFlag, startGame]);
  
  // Update AI speed
  const handleSpeedChange = (speed: aiPlayerService.AIPlayerConfig['speed']) => {
    setConfig(prev => ({ ...prev, speed }));
  };
  
  // Toggle auto restart
  const toggleAutoRestart = () => {
    setConfig(prev => ({ ...prev, autoRestart: !prev.autoRestart }));
  };
  
  // Reset game and AI
  const handleReset = () => {
    setIsPlaying(false);
    restartGame();
  };
  
  // Handle closing the AI panel
  const handleClose = () => {
    setIsPlaying(false);
    setConfig(prev => ({ ...prev, enabled: false }));
    onClose();
  };
  
  if (!config.enabled) return null;
  
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      p={4}
      bg={bgColor}
      borderTop="2px solid"
      borderColor={borderColor}
      boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.2)"
      zIndex={100}
      color={textColor}
    >
      <Flex direction="column" maxW="container.md" mx="auto">
        <Flex justify="space-between" align="center" mb={2}>
          <HStack>
            <FaRobot size={20} />
            <Text fontWeight="bold" fontSize="lg">
              AI Player
            </Text>
            
            <Badge 
              colorScheme={isPlaying ? "green" : "gray"} 
              variant="solid" 
              fontSize="md" 
              p={1}
            >
              {isPlaying ? "Playing" : "Paused"}
            </Badge>
          </HStack>
          
          <HStack>
            <Select 
              size="sm" 
              width="120px" 
              value={config.speed} 
              onChange={(e) => handleSpeedChange(e.target.value as any)}
            >
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </Select>
            
            <Tooltip label="Auto Restart">
              <IconButton
                aria-label="Auto Restart"
                icon={<FaCog />}
                size="sm"
                colorScheme={config.autoRestart ? "teal" : "gray"}
                onClick={toggleAutoRestart}
              />
            </Tooltip>
            
            <Button size="sm" colorScheme="red" onClick={handleClose} fontWeight="bold">
              Close AI
            </Button>
          </HStack>
        </Flex>
        
        <Flex align="center" gap={2}>
          <Tooltip label={isPlaying ? "Pause AI" : "Start AI"}>
            <IconButton
              aria-label={isPlaying ? "Pause AI" : "Start AI"}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              size="md"
              onClick={togglePlaying}
              colorScheme={isPlaying ? "orange" : "green"}
              isDisabled={gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST}
            />
          </Tooltip>
          
          <Tooltip label="Make Single Move">
            <IconButton
              aria-label="Make Single Move"
              icon={<FaStepForward />}
              size="md"
              onClick={makeSingleMove}
              colorScheme="blue"
              isDisabled={isPlaying || gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST}
            />
          </Tooltip>
          
          <Tooltip label="Reset Game">
            <IconButton
              aria-label="Reset Game"
              icon={<FaRedo />}
              size="md"
              onClick={handleReset}
              colorScheme="red"
            />
          </Tooltip>
          
          <Text ml={4}>
            AI Speed: <Badge colorScheme="blue">{config.speed}</Badge>
          </Text>
          
          <Text ml={4}>
            Auto Restart: <Badge colorScheme={config.autoRestart ? "green" : "red"}>
              {config.autoRestart ? "On" : "Off"}
            </Badge>
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AIPlayer; 