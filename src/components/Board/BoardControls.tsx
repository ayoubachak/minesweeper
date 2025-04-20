import React from 'react';
import {
  Box,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  Tooltip,
  useBreakpointValue,
  Center,
  Text,
  Badge,
  Flex
} from '@chakra-ui/react';
import { FaSearchMinus, FaSearchPlus, FaExpand } from 'react-icons/fa';

interface BoardControlsProps {
  cellSize: number;
  onCellSizeChange: (size: number) => void;
  resetZoom: () => void;
  minSize: number;
  maxSize: number;
}

const BoardControls: React.FC<BoardControlsProps> = ({
  cellSize,
  onCellSizeChange,
  resetZoom,
  minSize,
  maxSize
}) => {
  // Determine if we should show the full slider based on screen size
  const showFullControls = useBreakpointValue({ base: false, md: true });
  
  // Calculate zoom percentage
  const zoomPercentage = Math.round((cellSize / 30) * 100);
  
  return (
    <Box 
      w="100%"
      mt={4}
      bg="rgba(0,0,0,0.1)" 
      p={3} 
      borderRadius="md"
      boxShadow="sm"
      aria-label="Zoom controls"
      role="group"
    >
      <Flex justify="space-between" align="center">
        <Text fontWeight="medium" fontSize="sm" mb={showFullControls ? 2 : 0}>
          Board Zoom
        </Text>
        
        <Badge colorScheme="blue" variant="solid" p={1} minW="60px" textAlign="center">
          {zoomPercentage}%
        </Badge>
      </Flex>
      
      {showFullControls ? (
        <HStack spacing={4} align="center" mt={2}>
          <HStack spacing={2} width="100%">
            <IconButton
              aria-label="Zoom out"
              icon={<FaSearchMinus />}
              size="sm"
              onClick={() => onCellSizeChange(Math.max(cellSize - 2, minSize))}
            />
            
            <Slider
              value={cellSize}
              min={minSize}
              max={maxSize}
              step={1}
              onChange={onCellSizeChange}
              flex="1"
              aria-label="Zoom level"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            
            <IconButton
              aria-label="Zoom in"
              icon={<FaSearchPlus />}
              size="sm"
              onClick={() => onCellSizeChange(Math.min(cellSize + 2, maxSize))}
            />
            
            <Tooltip label="Reset zoom">
              <IconButton
                aria-label="Reset zoom"
                icon={<FaExpand />}
                size="sm"
                onClick={resetZoom}
              />
            </Tooltip>
          </HStack>
        </HStack>
      ) : (
        <HStack spacing={2} justify="center" mt={2}>
          <IconButton
            aria-label="Zoom out"
            icon={<FaSearchMinus />}
            size="sm"
            onClick={() => onCellSizeChange(Math.max(cellSize - 2, minSize))}
          />
          <IconButton
            aria-label="Reset zoom"
            icon={<FaExpand />}
            size="sm"
            onClick={resetZoom}
          />
          <IconButton
            aria-label="Zoom in"
            icon={<FaSearchPlus />}
            size="sm"
            onClick={() => onCellSizeChange(Math.min(cellSize + 2, maxSize))}
          />
        </HStack>
      )}
    </Box>
  );
};

export default BoardControls; 