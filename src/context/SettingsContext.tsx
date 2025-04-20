import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Difficulty, GameSettings } from '../types/game.types';
import * as storageService from '../services/storageService';
import * as gameService from '../services/gameService';

// Context type
interface SettingsContextType {
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  updateDifficulty: (difficulty: Difficulty) => void;
  resetSettings: () => void;
}

// Create context
export const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings state
  const [settings, setSettings] = useState<GameSettings>(storageService.DEFAULT_SETTINGS);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = storageService.getSettings();
    setSettings(savedSettings);
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);
  
  // Update difficulty and set appropriate board dimensions
  const updateDifficulty = useCallback((difficulty: Difficulty) => {
    if (difficulty === Difficulty.CUSTOM) {
      // Just update the difficulty name, keep current dimensions
      setSettings(prevSettings => ({
        ...prevSettings,
        difficulty,
      }));
    } else {
      // Update difficulty and dimensions
      const { rows, cols, mines } = gameService.getDifficultySettings(difficulty);
      
      setSettings(prevSettings => ({
        ...prevSettings,
        difficulty,
        rows,
        cols,
        mines,
      }));
    }
  }, []);
  
  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(storageService.DEFAULT_SETTINGS);
  }, []);
  
  // Context value
  const value = useMemo(() => ({
    settings,
    updateSettings,
    updateDifficulty,
    resetSettings,
  }), [settings, updateSettings, updateDifficulty, resetSettings]);
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 