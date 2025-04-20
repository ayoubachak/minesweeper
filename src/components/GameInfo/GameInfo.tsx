import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { FaBomb, FaFlag, FaUndo, FaHome } from 'react-icons/fa';
import { TbZoomIn } from 'react-icons/tb';
import { MdTimer } from 'react-icons/md';

interface GameInfoProps {
  minesLeft: number;
  flagCount: number;
  time: number;
  gameMode: 'bomb' | 'flag';
  onToggleMode: () => void;
  onResetGame: () => void;
  onGoHome: () => void;
  cellSize?: number;
  defaultCellSize?: number;
}

const GameInfo: React.FC<GameInfoProps> = ({
  minesLeft,
  flagCount,
  time,
  gameMode,
  onToggleMode,
  onResetGame,
  onGoHome,
  cellSize,
  defaultCellSize
}) => {
  const displayTime = Math.floor(time / 1000);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Format time as mm:ss
  const formattedTime = `${Math.floor(displayTime / 60)
    .toString()
    .padStart(2, '0')}:${(displayTime % 60).toString().padStart(2, '0')}`;
  
  // Calculate zoom percentage if both cellSize and defaultCellSize are provided
  const zoomPercent = cellSize && defaultCellSize 
    ? Math.round((cellSize / defaultCellSize) * 100)
    : null;
  
  return (
    <Box 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      p={2} 
      mb={4} 
      bg={bgColor}
      boxShadow="sm"
      width="100%"
    >
      <Flex 
        justify="space-between" 
        align="center"
        flexDirection={{ base: 'column', sm: 'row' }}
        gap={2}
      >
        <HStack spacing={4}>
          <Tooltip label="Return to menu">
            <IconButton
              aria-label="Go home"
              icon={<FaHome />}
              size="sm"
              onClick={onGoHome}
              variant="ghost"
            />
          </Tooltip>
          
          <Tooltip label="Reset game">
            <IconButton
              aria-label="Reset game"
              icon={<FaUndo />}
              size="sm" 
              onClick={onResetGame}
              variant="ghost"
            />
          </Tooltip>
        </HStack>
        
        <HStack spacing={4}>
          <Tooltip label={`Mines: ${minesLeft}`}>
            <HStack>
              <Icon as={FaBomb} color="red.500" />
              <Text fontWeight="bold">{minesLeft}</Text>
            </HStack>
          </Tooltip>
          
          <Tooltip label={`Flags placed: ${flagCount}`}>
            <HStack>
              <Icon as={FaFlag} color="orange.500" />
              <Text fontWeight="bold">{flagCount}</Text>
            </HStack>
          </Tooltip>
          
          <Tooltip label={`Time elapsed: ${formattedTime}`}>
            <HStack>
              <Icon as={MdTimer} />
              <Text fontWeight="bold">{formattedTime}</Text>
            </HStack>
          </Tooltip>
          
          {zoomPercent !== null && (
            <Tooltip label={`Zoom level: ${zoomPercent}%`}>
              <HStack>
                <Icon as={TbZoomIn} />
                <Text fontSize="sm">{zoomPercent}%</Text>
              </HStack>
            </Tooltip>
          )}
        </HStack>
        
        <Tooltip
          label={gameMode === 'bomb' ? 'Click to switch to flag mode' : 'Click to switch to reveal mode'}
        >
          <Button
            size="sm"
            leftIcon={gameMode === 'bomb' ? <FaBomb /> : <FaFlag />}
            colorScheme={gameMode === 'bomb' ? 'blue' : 'orange'}
            onClick={onToggleMode}
            variant="solid"
          >
            <Text display={{ base: 'none', md: 'block' }}>
              {gameMode === 'bomb' ? 'Reveal Mode' : 'Flag Mode'}
            </Text>
          </Button>
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default GameInfo; 