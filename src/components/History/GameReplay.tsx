import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaFastForward, 
  FaFastBackward,
  FaStop,
  FaTrophy,
  FaBomb,
  FaHome,
  FaTimes
} from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import { GameContext } from '../../context/GameContext';
import { GameStatus } from '../../types/game.types';

// Create a formatTime utility function inline since the import isn't working
const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

interface GameReplayProps {
  onClose: () => void;
}

const GameReplay: React.FC<GameReplayProps> = ({ onClose }) => {
  const { 
    isReplayMode, 
    replayStep, 
    currentReplayStep, 
    totalReplaySteps, 
    exitReplay,
    gameBoard,
    replayGameData
  } = useContext(GameContext);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // seconds per step
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { isOpen, onOpen, onClose: closeModal } = useDisclosure();
  
  // Improved contrast
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  
  // Determine if we're on the final step of a completed game
  const isLastStep = currentReplayStep === totalReplaySteps - 1;
  const isGameComplete = gameBoard.status === GameStatus.WON || gameBoard.status === GameStatus.LOST;
  const showFinalState = isLastStep && isGameComplete;
  
  // Use the original game's status from replayGameData to determine the outcome correctly
  const wasGameWon = replayGameData && replayGameData.isComplete && 
    replayGameData.gameBoard.status === GameStatus.WON;
  const wasGameLost = replayGameData && replayGameData.isComplete && 
    replayGameData.gameBoard.status === GameStatus.LOST;
  
  // Calculate time played if the game is complete
  const gameTime = gameBoard.startTime && gameBoard.endTime 
    ? Math.floor((gameBoard.endTime - gameBoard.startTime) / 1000)
    : 0;
  
  // Show result modal when game completes during replay
  useEffect(() => {
    if (isLastStep && isGameComplete && isPlaying) {
      setIsPlaying(false);
      onOpen(); // Open the result modal
    }
  }, [isLastStep, isGameComplete, isPlaying, onOpen]);
  
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
    setIsPlaying(false); // Pause playback when manually changing step
    replayStep(value);
  };
  
  // Playback controls
  const togglePlayback = () => {
    // Don't allow starting playback if we're at the end
    if (!isPlaying && currentReplayStep >= totalReplaySteps - 1) return;
    setIsPlaying(!isPlaying);
  };
  
  const stepForward = () => {
    if (currentReplayStep < totalReplaySteps - 1) {
      setIsPlaying(false);
      replayStep(currentReplayStep + 1);
    }
  };
  
  const stepBackward = () => {
    if (currentReplayStep > 0) {
      setIsPlaying(false);
      replayStep(currentReplayStep - 1);
    }
  };
  
  const skipToStart = () => {
    setIsPlaying(false);
    replayStep(0);
  };
  
  const skipToEnd = () => {
    setIsPlaying(false);
    replayStep(totalReplaySteps - 1);
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
  
  // Handle playback completed
  const handleReplayCompleted = () => {
    closeModal();
    // The modal will show game completed
  };
  
  // Handle return to main menu
  const handleBackToMenu = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    closeModal(); // Close the modal if open
    exitReplay(); // Exit replay mode
    onClose(); // Call the onClose prop to ensure proper navigation
  }, [exitReplay, closeModal, onClose]);
  
  if (!isReplayMode) return null;
  
  return (
    <>
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
              <Text fontWeight="bold" fontSize="lg">
                Game Replay
              </Text>
              
              {/* Show game result if we're at the final step */}
              {showFinalState && (
                <Badge 
                  colorScheme={wasGameWon ? "green" : "red"} 
                  variant="solid" 
                  fontSize="md" 
                  p={1}
                >
                  <HStack spacing={1}>
                    {wasGameWon ? <FaTrophy /> : <FaBomb />}
                    <Text>{wasGameWon ? "Victory!" : "Game Over"}</Text>
                  </HStack>
                </Badge>
              )}
              
              {/* Show game time if complete */}
              {showFinalState && gameBoard.startTime && gameBoard.endTime && (
                <Badge colorScheme="blue" variant="solid" fontSize="md" p={1}>
                  Time: {formatTime(gameTime)}
                </Badge>
              )}
            </HStack>
            
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
      
      {/* Game Completed Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={closeModal} 
        isCentered 
        size="md"
        closeOnOverlayClick={true}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader 
            textAlign="center" 
            bg={wasGameWon ? "green.100" : "red.100"}
            color={wasGameWon ? "green.700" : "red.700"}
            borderTopRadius="md"
          >
            {wasGameWon ? "Victory!" : "Game Over"}
          </ModalHeader>
          <ModalBody textAlign="center" py={6}>
            {wasGameWon ? (
              <Text fontSize="lg">Game completed in {formatTime(
                gameBoard.startTime && gameBoard.endTime 
                  ? gameBoard.endTime - gameBoard.startTime 
                  : 0
              )}!</Text>
            ) : (
              <Text fontSize="lg">Better luck next time!</Text>
            )}
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              leftIcon={<FaHome />}
              colorScheme="blue"
              mr={3}
              onClick={handleBackToMenu}
            >
              Return to Main Menu
            </Button>
            <Button 
              colorScheme={wasGameWon ? "green" : "red"} 
              onClick={handleReplayCompleted}
            >
              Continue Viewing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GameReplay; 