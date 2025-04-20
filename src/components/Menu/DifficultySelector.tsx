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
  useColorModeValue
} from '@chakra-ui/react';
import { SettingsContext } from '../../context/SettingsContext';
import { Difficulty } from '../../types/game.types';

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
    if (!isNaN(rows) && rows > 0) {
      updateSettings({ rows });
    }
  };
  
  const handleColsChange = (value: string) => {
    const cols = parseInt(value);
    if (!isNaN(cols) && cols > 0) {
      updateSettings({ cols });
    }
  };
  
  const handleMinesChange = (value: string) => {
    const mines = parseInt(value);
    if (!isNaN(mines) && mines > 0) {
      updateSettings({ mines });
    }
  };
  
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
          <Grid 
            templateColumns={["1fr", "repeat(3, 1fr)"]} 
            gap={4}
          >
            <FormControl>
              <FormLabel>Rows</FormLabel>
              <NumberInput 
                min={5} 
                max={24} 
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
                min={5} 
                max={30} 
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
                max={Math.floor(settings.rows * settings.cols * 0.35)} 
                value={settings.mines}
                onChange={handleMinesChange}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default DifficultySelector; 