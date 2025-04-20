import React, { useContext } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  useColorMode,
  VStack,
  Text
} from '@chakra-ui/react';
import { SettingsContext } from '../../context/SettingsContext';
import { GameMode } from '../../types/game.types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useContext(SettingsContext);
  const { colorMode, toggleColorMode } = useColorMode();
  
  const handleShowTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ showTimer: e.target.checked });
  };
  
  const handleEnableAnimationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ enableAnimations: e.target.checked });
  };
  
  const handleThemeChange = (theme: string) => {
    updateSettings({ theme });
    
    // If the color mode doesn't match the theme, toggle it
    if ((theme === 'light' && colorMode === 'dark') || 
        (theme === 'dark' && colorMode === 'light')) {
      toggleColorMode();
    }
  };
  
  const handleGameModeChange = (mode: string) => {
    updateSettings({ gameMode: mode as GameMode });
  };
  
  const handleReset = () => {
    resetSettings();
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Game Settings */}
            <VStack align="flex-start" spacing={4}>
              <Heading as="h3" size="md">Game Settings</Heading>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="show-timer" mb="0">
                  Show Timer
                </FormLabel>
                <Switch
                  id="show-timer"
                  isChecked={settings.showTimer}
                  onChange={handleShowTimerChange}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Input Mode</FormLabel>
                <RadioGroup 
                  value={settings.gameMode} 
                  onChange={handleGameModeChange}
                  colorScheme="blue"
                >
                  <VStack align="start" spacing={2}>
                    <Radio value={GameMode.BOMB}>
                      <Text fontWeight="medium">Bomb Mode</Text>
                      <Text fontSize="sm" color="gray.500">
                        Left-click reveals cells, right-click places flags
                      </Text>
                    </Radio>
                    <Radio value={GameMode.FLAG}>
                      <Text fontWeight="medium">Flag Mode</Text>
                      <Text fontSize="sm" color="gray.500">
                        Left-click places flags, right-click reveals cells
                      </Text>
                    </Radio>
                  </VStack>
                </RadioGroup>
              </FormControl>
            </VStack>
            
            <Divider />
            
            {/* UI Settings */}
            <VStack align="flex-start" spacing={4}>
              <Heading as="h3" size="md">UI Settings</Heading>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="enable-animations" mb="0">
                  Enable Animations
                </FormLabel>
                <Switch
                  id="enable-animations"
                  isChecked={settings.enableAnimations}
                  onChange={handleEnableAnimationsChange}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Theme</FormLabel>
                <RadioGroup 
                  value={settings.theme} 
                  onChange={handleThemeChange}
                  colorScheme="blue"
                >
                  <HStack spacing={4}>
                    <Radio value="light">Light</Radio>
                    <Radio value="dark">Dark</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="red" mr={3} onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button colorScheme="blue" onClick={onClose}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsPanel; 