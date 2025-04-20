import React, { useState } from 'react';
import { Box, ChakraProvider, Container, Flex, IconButton, useColorMode } from '@chakra-ui/react';
import { FaCog, FaHome } from 'react-icons/fa';
import Board from './components/Board/Board';
import GameInfo from './components/Header/GameInfo';
import MainMenu from './components/Menu/MainMenu';
import { GameProvider } from './context/GameContext';
import { SettingsProvider } from './context/SettingsContext';
import theme from './theme';

const App: React.FC = () => {
  const [showMenu, setShowMenu] = useState<boolean>(true);
  
  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };
  
  // Function to start the game (hide menu and show game board)
  const startGame = () => {
    setShowMenu(false);
  };
  
  // Function to return to the main menu
  const returnToMenu = () => {
    setShowMenu(true);
  };
  
  return (
    <ChakraProvider theme={theme}>
      <SettingsProvider>
        <GameProvider>
          <Container maxW="container.md" py={5}>
            <Flex 
              direction="column"
              minH="calc(100vh - 40px)"
              align="center"
              justify="center"
              position="relative"
            >
              {/* Home/Menu Button */}
              <IconButton
                aria-label="Toggle Menu"
                icon={showMenu ? <FaCog /> : <FaHome />}
                position="absolute"
                top={2}
                right={2}
                onClick={toggleMenu}
                colorScheme="blue"
                zIndex={10}
                size="md"
              />
              
              {showMenu ? (
                <MainMenu onStartGame={startGame} />
              ) : (
                <Box width="100%">
                  <GameInfo />
                  <Board onReturnToMenu={returnToMenu} />
                </Box>
              )}
            </Flex>
          </Container>
        </GameProvider>
      </SettingsProvider>
    </ChakraProvider>
  );
};

export default App; 