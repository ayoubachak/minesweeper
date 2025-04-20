import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Heading,
  Badge,
  Divider,
  HStack,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { FaHome, FaRedo, FaTrophy } from 'react-icons/fa';
import { GameStatus, Difficulty, GameScore } from '../../types/game.types';
import * as storageService from '../../services/storageService';

interface GameOverModalProps {
  isOpen: boolean;
  status: GameStatus;
  difficulty: Difficulty;
  time: number | null;
  onRestart: () => void;
  onMainMenu: () => void;
}

const formatTime = (ms: number | null): string => {
  if (!ms) return '00:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  status,
  difficulty,
  time,
  onRestart,
  onMainMenu
}) => {
  const [topScores, setTopScores] = useState<GameScore[]>([]);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBgColor = useColorModeValue(
    status === GameStatus.WON ? 'green.100' : 'red.100',
    status === GameStatus.WON ? 'green.900' : 'red.900'
  );
  
  useEffect(() => {
    if (isOpen && status === GameStatus.WON && time) {
      const scores = storageService.getTopScores(difficulty);
      setTopScores(scores.slice(0, 3)); // Get top 3 scores
      
      // Find rank of current score
      if (scores.length > 0) {
        const position = scores.findIndex(score => time < score.time);
        if (position >= 0) {
          setCurrentRank(position + 1);
        } else {
          setCurrentRank(scores.length + 1);
        }
      } else {
        setCurrentRank(1);
      }
    }
  }, [isOpen, status, difficulty, time]);
  
  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader 
          bg={headerBgColor} 
          borderTopRadius="md"
          textAlign="center"
        >
          {status === GameStatus.WON ? 'Victory!' : 'Game Over'}
        </ModalHeader>
        
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {status === GameStatus.WON ? (
              <>
                <VStack>
                  <Text fontSize="lg">You completed the game in:</Text>
                  <Heading size="xl">{formatTime(time)}</Heading>
                  
                  {currentRank && currentRank <= 3 && (
                    <Badge colorScheme="yellow" p={2} mt={2} fontSize="md">
                      <HStack spacing={2}>
                        <FaTrophy />
                        <Text>New high score! Rank #{currentRank}</Text>
                      </HStack>
                    </Badge>
                  )}
                </VStack>
                
                {topScores.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Heading size="sm" mb={3}>Top Scores for {difficulty}:</Heading>
                      {topScores.map((score, index) => (
                        <HStack key={score.id} justify="space-between" p={2} bg={index === 0 ? 'yellow.100' : 'transparent'} borderRadius="md">
                          <Text fontWeight={index === 0 ? 'bold' : 'normal'}>
                            #{index + 1}
                          </Text>
                          <Text fontWeight={index === 0 ? 'bold' : 'normal'}>
                            {formatTime(score.time)}
                          </Text>
                        </HStack>
                      ))}
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Text fontSize="lg" textAlign="center">Better luck next time!</Text>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={4} justify="center" width="100%">
            <Button 
              leftIcon={<FaHome />} 
              onClick={onMainMenu}
              colorScheme="blue"
              variant="outline"
            >
              Main Menu
            </Button>
            <Button 
              leftIcon={<FaRedo />} 
              onClick={onRestart}
              colorScheme="green"
            >
              Play Again
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GameOverModal; 