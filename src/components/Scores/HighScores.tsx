import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import { SettingsContext } from '../../context/SettingsContext';
import { Difficulty, GameScore } from '../../types/game.types';
import * as storageService from '../../services/storageService';

interface HighScoresProps {
  isOpen: boolean;
  onClose: () => void;
}

const HighScores: React.FC<HighScoresProps> = ({ isOpen, onClose }) => {
  const { settings } = useContext(SettingsContext);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);
  const [scores, setScores] = useState<GameScore[]>([]);
  
  // Load scores when modal opens or difficulty changes
  useEffect(() => {
    if (isOpen) {
      const topScores = storageService.getTopScores(difficulty);
      setScores(topScores);
    }
  }, [isOpen, difficulty]);
  
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as Difficulty);
  };
  
  const handleClearScores = () => {
    storageService.clearScores();
    setScores([]);
  };
  
  // Format time in seconds to mm:ss
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const tableBackground = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>High Scores</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Flex mb={4} justifyContent="space-between" alignItems="center">
            <Select
              width="200px"
              value={difficulty}
              onChange={handleDifficultyChange}
              colorScheme="blue"
            >
              <option value={Difficulty.BEGINNER}>Beginner</option>
              <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
              <option value={Difficulty.EXPERT}>Expert</option>
              <option value={Difficulty.CUSTOM}>Custom</option>
            </Select>
            
            <Button colorScheme="red" size="sm" onClick={handleClearScores}>
              Clear All Scores
            </Button>
          </Flex>
          
          {scores.length > 0 ? (
            <Box
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Rank</Th>
                    <Th>Time</Th>
                    <Th>Grid Size</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {scores.map((score, index) => (
                    <Tr key={score.id}>
                      <Td>{index + 1}</Td>
                      <Td>{formatTime(score.time)}</Td>
                      <Td>{`${score.rows}×${score.cols} (${score.mines})`}</Td>
                      <Td>{formatDate(score.date)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box
              p={8}
              textAlign="center"
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
            >
              <Text fontSize="lg">No scores recorded yet.</Text>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HighScores; 