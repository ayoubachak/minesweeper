import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  HStack,
  Badge,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaFastForward, 
  FaFastBackward,
  FaStop
} from 'react-icons/fa';
import { GameContext } from '../../context/GameContext';

interface GameReplayProps {
  onClose: () => void;
}

const GameReplay: React.FC<GameReplayProps> = ({ onClose }) => {
  const { 
    isReplayMode, 
    replayStep, 
    currentReplayStep, 
    totalReplaySteps, 
    exitReplay 
  } = useContext(GameContext);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // seconds per step
  
  // Improved contrast
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !isReplayMode) return;
    
    // If we reach the end, stop playback
    if (currentReplayStep >= totalReplaySteps - 1) {
      setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      replayStep(currentReplayStep + 1);
    }, 1000 / playbackSpeed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentReplayStep, totalReplaySteps, replayStep, playbackSpeed, isReplayMode]);
  
  // Handle slider change
  const handleSliderChange = (value: number) => {
    replayStep(value);
  };
  
  // Playback controls
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const stepForward = () => {
    if (currentReplayStep < totalReplaySteps - 1) {
      replayStep(currentReplayStep + 1);
    }
  };
  
  const stepBackward = () => {
    if (currentReplayStep > 0) {
      replayStep(currentReplayStep - 1);
    }
  };
  
  const skipToStart = () => {
    replayStep(0);
    setIsPlaying(false);
  };
  
  const skipToEnd = () => {
    replayStep(totalReplaySteps - 1);
    setIsPlaying(false);
  };
  
  const handleSpeedChange = () => {
    // Toggle between 1x, 2x, and 4x speeds
    setPlaybackSpeed(prev => prev === 4 ? 1 : prev * 2);
  };
  
  const handleClose = () => {
    setIsPlaying(false);
    exitReplay();
    onClose();
  };
  
  if (!isReplayMode) return null;
  
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
          <Text fontWeight="bold" fontSize="lg">
            Game Replay
          </Text>
          
          <HStack>
            <Badge colorScheme="blue" variant="solid" fontSize="md" p={1}>
              Step {currentReplayStep + 1} of {totalReplaySteps}
            </Badge>
            
            <Badge colorScheme="green" variant="solid" fontSize="md" p={1}>
              {playbackSpeed}x speed
            </Badge>
            
            <Button size="sm" colorScheme="red" onClick={handleClose} fontWeight="bold">
              Exit Replay
            </Button>
          </HStack>
        </Flex>
        
        <Flex align="center" gap={2}>
          <Tooltip label="Skip to Start">
            <IconButton
              aria-label="Skip to Start"
              icon={<FaFastBackward />}
              size="md"
              onClick={skipToStart}
              isDisabled={currentReplayStep === 0}
              colorScheme="blue"
            />
          </Tooltip>
          
          <Tooltip label="Previous Step">
            <IconButton
              aria-label="Previous Step"
              icon={<FaStepBackward />}
              size="md"
              onClick={stepBackward}
              isDisabled={currentReplayStep === 0}
              colorScheme="blue"
            />
          </Tooltip>
          
          <Tooltip label={isPlaying ? "Pause" : "Play"}>
            <IconButton
              aria-label={isPlaying ? "Pause" : "Play"}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              size="md"
              onClick={togglePlayback}
              colorScheme={isPlaying ? "orange" : "green"}
              isDisabled={currentReplayStep >= totalReplaySteps - 1}
            />
          </Tooltip>
          
          <Tooltip label="Next Step">
            <IconButton
              aria-label="Next Step"
              icon={<FaStepForward />}
              size="md"
              onClick={stepForward}
              isDisabled={currentReplayStep >= totalReplaySteps - 1}
              colorScheme="blue"
            />
          </Tooltip>
          
          <Tooltip label="Skip to End">
            <IconButton
              aria-label="Skip to End"
              icon={<FaFastForward />}
              size="md"
              onClick={skipToEnd}
              isDisabled={currentReplayStep >= totalReplaySteps - 1}
              colorScheme="blue"
            />
          </Tooltip>
          
          <Tooltip label={`Speed: ${playbackSpeed}x`}>
            <Button size="md" onClick={handleSpeedChange} ml={2} colorScheme="teal">
              {playbackSpeed}x
            </Button>
          </Tooltip>
          
          <Slider
            aria-label="Game progress"
            value={currentReplayStep}
            min={0}
            max={totalReplaySteps - 1}
            step={1}
            onChange={handleSliderChange}
            flex="1"
            ml={2}
            colorScheme="blue"
          >
            <SliderTrack bg="gray.300">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Flex>
      </Flex>
    </Box>
  );
};

export default GameReplay; 