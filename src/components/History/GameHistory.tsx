import React, { useContext, useState, useEffect } from 'react';
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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Alert,
  AlertIcon,
  HStack
} from '@chakra-ui/react';
import { GameContext } from '../../context/GameContext';
import { Difficulty, GameStatus } from '../../types/game.types';
import { GameAction, GameHistoryEntry, clearGameHistory } from '../../services/gameHistoryService';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ isOpen, onClose }) => {
  const { gameHistory, replayGame, refreshGameHistory } = useContext(GameContext);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState<GameHistoryEntry[]>([]);
  const toast = useToast();
  
  // Sync with gameHistory when modal opens
  useEffect(() => {
    if (isOpen) {
      // Explicitly refresh the game history when opening
      refreshGameHistory();
      setTimeout(() => {
        setLocalHistory(gameHistory);
        console.log(`Showing ${gameHistory.length} games in history modal`);
      }, 100);
    }
  }, [isOpen, gameHistory, refreshGameHistory]);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Format time in milliseconds to mm:ss
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format action type to be more readable
  const formatActionType = (type: string): string => {
    switch (type) {
      case 'REVEAL': return 'Revealed Cell';
      case 'FLAG': return 'Flagged Cell';
      case 'CHORD': return 'Chorded Cell';
      case 'START': return 'Game Started';
      case 'RESTART': return 'Game Restarted';
      default: return type;
    }
  };
  
  // Handle replay button click
  const handleReplay = (gameId: string) => {
    replayGame(gameId);
    onClose();
  };
  
  // Handle clear history
  const handleClearHistory = () => {
    try {
      clearGameHistory();
      setLocalHistory([]);
      toast({
        title: 'History cleared',
        description: 'All game history has been cleared',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Could not clear game history',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Game History</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {localHistory.length > 0 ? (
            <>
              <Flex justify="flex-end" mb={4}>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => {
                      refreshGameHistory();
                      setTimeout(() => setLocalHistory(gameHistory), 100);
                      toast({
                        title: 'History refreshed',
                        status: 'info',
                        duration: 2000,
                      });
                    }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    onClick={handleClearHistory}
                    variant="outline"
                  >
                    Clear All History
                  </Button>
                </HStack>
              </Flex>
              
              <Accordion allowToggle>
                {localHistory.map((game) => (
                  <AccordionItem key={game.id}>
                    <h2>
                      <AccordionButton 
                        onClick={() => setSelectedGameId(selectedGameId === game.id ? null : game.id)}
                      >
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="bold">
                            {formatDate(game.startTime)}
                          </Text>
                          <Flex mt={1} gap={2} wrap="wrap">
                            <Badge colorScheme={game.isComplete ? (game.gameBoard.status === GameStatus.WON ? 'green' : 'red') : 'gray'}>
                              {game.isComplete 
                                ? (game.gameBoard.status === GameStatus.WON ? 'Win' : 'Loss') 
                                : 'Incomplete'}
                            </Badge>
                            <Badge colorScheme="blue">
                              {game.gameBoard.rows}×{game.gameBoard.cols}
                            </Badge>
                            <Badge colorScheme="purple">
                              {game.gameBoard.mines} mines
                            </Badge>
                            {game.endTime && (
                              <Badge colorScheme="teal">
                                {formatTime(game.endTime - game.startTime)}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Flex justify="space-between" mb={4}>
                        <Text fontSize="sm" color="gray.500">
                          {game.actions.length} moves recorded
                        </Text>
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => handleReplay(game.id)}
                        >
                          Replay Game
                        </Button>
                      </Flex>
                      
                      {game.actions.length > 0 ? (
                        <Box
                          maxH="300px"
                          overflowY="auto"
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={borderColor}
                        >
                          <Table variant="simple" size="sm">
                            <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                              <Tr>
                                <Th>Time</Th>
                                <Th>Action</Th>
                                <Th>Position</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {game.actions.map((action, index) => (
                                <Tr key={index}>
                                  <Td>
                                    {formatTime(action.timestamp - game.startTime)}
                                  </Td>
                                  <Td>{formatActionType(action.type)}</Td>
                                  <Td>
                                    {action.position ? `(${action.position.row}, ${action.position.col})` : '-'}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      ) : (
                        <Text>No actions recorded for this game.</Text>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          ) : (
            <Box
              p={8}
              textAlign="center"
              borderWidth="1px"
              borderRadius="lg"
              borderColor={borderColor}
            >
              <Text fontSize="lg">No game history recorded yet.</Text>
              <Text fontSize="md" mt={2} color="gray.500">
                Complete a game to record it in your history.
              </Text>
            </Box>
          )}
          
          {localHistory.length === 0 && gameHistory.length > 0 && (
            <Alert status="info" mt={4}>
              <AlertIcon />
              There seems to be game history available, but it's not showing. Try closing and reopening this dialog.
            </Alert>
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

export default GameHistory; 