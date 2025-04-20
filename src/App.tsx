import React, { useState, useContext, useEffect } from 'react';
import { Box, ChakraProvider, Container, Flex, IconButton, useColorMode } from '@chakra-ui/react';
import { FaCog, FaHome } from 'react-icons/fa';
import Board from './components/Board/Board';
import GameInfo from './components/Header/GameInfo';
import MainMenu from './components/Menu/MainMenu';
import { GameProvider, GameContext } from './context/GameContext';
import { SettingsProvider } from './context/SettingsContext';
import GameReplay from './components/History/GameReplay';
import AIPlayer from './components/AI/AIPlayer';
import theme from './theme';

const AppContent: React.FC = () => {
  const [showMenu, setShowMenu] = useState<boolean>(true);
  const [showAI, setShowAI] = useState<boolean>(false);
  const { isReplayMode } = useContext(GameContext);
  
  // Hide menu when in replay mode
  useEffect(() => {
    if (isReplayMode) {
      setShowMenu(false);
    }
  }, [isReplayMode]);
  
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
    setShowAI(false); // Ensure AI is disabled when returning to menu
  };
  
  // Function to start the AI player
  const startAI = () => {
    setShowAI(true);
  };
  
  // Function to close the AI player
  const closeAI = () => {
    setShowAI(false);
  };
  
  return (
    <Flex 
      direction="column"
      minH="calc(100vh - 40px)"
      align="center"
      justify="center"
      position="relative"
    >
      {/* Home/Menu Button - Hidden in replay mode */}
      {!isReplayMode && (
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
      )}
      
      {showMenu && !isReplayMode ? (
        <MainMenu onStartGame={startGame} onStartAI={startAI} />
      ) : (
        <Box width="100%">
          <GameInfo />
          <Board onReturnToMenu={returnToMenu} />
        </Box>
      )}
      
      {/* Show replay controls when in replay mode */}
      {isReplayMode && <GameReplay onClose={returnToMenu} />}
      
      {/* Show AI player when activated */}
      {showAI && !isReplayMode && <AIPlayer onClose={closeAI} />}
    </Flex>
  );
};

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <SettingsProvider>
        <GameProvider>
          <Container maxW="container.md" py={5}>
            <AppContent />
          </Container>
        </GameProvider>
      </SettingsProvider>
    </ChakraProvider>
  );
};

export default App; 