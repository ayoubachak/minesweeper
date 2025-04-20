import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { SettingsContext } from '../../context/SettingsContext';
import { Difficulty } from '../../types/game.types';

// Configuration limits
const MAX_ROWS = 40;     // Increased from 24
const MAX_COLS = 60;     // Increased from 30
const MIN_DIMENSION = 5;

const DifficultySelector: React.FC = () => {
  const { settings, updateDifficulty, updateSettings } = useContext(SettingsContext);
  const [showCustom, setShowCustom] = useState(settings.difficulty === Difficulty.CUSTOM);
  
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  const handleDifficultyChange = (value: string) => {
    const difficulty = value as Difficulty;
    updateDifficulty(difficulty);
    setShowCustom(difficulty === Difficulty.CUSTOM);
  };
  
  const handleRowsChange = (value: string) => {
    const rows = parseInt(value);
    if (!isNaN(rows) && rows >= MIN_DIMENSION && rows <= MAX_ROWS) {
      updateSettings({ rows });
      
      // Adjust mines if necessary to maintain reasonable density
      const maxMines = Math.floor(rows * settings.cols * 0.35);
      if (settings.mines > maxMines) {
        updateSettings({ mines: maxMines });
      }
    }
  };
  
  const handleColsChange = (value: string) => {
    const cols = parseInt(value);
    if (!isNaN(cols) && cols >= MIN_DIMENSION && cols <= MAX_COLS) {
      updateSettings({ cols });
      
      // Adjust mines if necessary to maintain reasonable density
      const maxMines = Math.floor(settings.rows * cols * 0.35);
      if (settings.mines > maxMines) {
        updateSettings({ mines: maxMines });
      }
    }
  };
  
  const handleMinesChange = (value: string) => {
    const mines = parseInt(value);
    const maxMines = Math.floor(settings.rows * settings.cols * 0.35);
    const minMines = 1;
    
    if (!isNaN(mines) && mines >= minMines && mines <= maxMines) {
      updateSettings({ mines });
    }
  };
  
  // Calculate maximum mines based on current dimensions
  const maxMines = Math.floor(settings.rows * settings.cols * 0.35);
  
  return (
    <Box>
      <Heading as="h3" size="md" mb={3}>
        Difficulty
      </Heading>
      
      <RadioGroup
        onChange={handleDifficultyChange}
        value={settings.difficulty}
        colorScheme="blue"
      >
        <Stack direction="row" spacing={4} wrap="wrap" mb={4}>
          <Radio value={Difficulty.BEGINNER}>Beginner</Radio>
          <Radio value={Difficulty.INTERMEDIATE}>Intermediate</Radio>
          <Radio value={Difficulty.EXPERT}>Expert</Radio>
          <Radio value={Difficulty.CUSTOM}>Custom</Radio>
        </Stack>
      </RadioGroup>
      
      {showCustom && (
        <Box bg={bgColor} p={3} borderRadius="md">
          <Text mb={3} fontSize="sm" color="gray.500">
            For the best experience, total cells should not exceed 1,000 (current: {settings.rows * settings.cols} cells).
          </Text>
          
          <Grid 
            templateColumns={["1fr", "repeat(3, 1fr)"]} 
            gap={4}
          >
            <FormControl>
              <FormLabel>Rows</FormLabel>
              <NumberInput 
                min={MIN_DIMENSION} 
                max={MAX_ROWS} 
                value={settings.rows}
                onChange={handleRowsChange}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Columns</FormLabel>
              <NumberInput 
                min={MIN_DIMENSION} 
                max={MAX_COLS} 
                value={settings.cols}
                onChange={handleColsChange}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Mines</FormLabel>
              <NumberInput 
                min={1} 
                max={maxMines}
                value={settings.mines}
                onChange={handleMinesChange}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Max: {maxMines} mines ({Math.round(maxMines * 100 / (settings.rows * settings.cols))}%)
              </Text>
            </FormControl>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default DifficultySelector; 