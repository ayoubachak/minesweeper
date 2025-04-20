import { Difficulty, GameMode, GameScore, GameSettings } from '../types/game.types';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const SCORES_KEY = 'minesweeper_scores';
const SETTINGS_KEY = 'minesweeper_settings';

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: Difficulty.BEGINNER,
  rows: 9,
  cols: 9,
  mines: 10,
  showTimer: true,
  enableAnimations: true,
  theme: 'light',
  gameMode: GameMode.BOMB,
};

// Utility function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

/**
 * Save a new score to localStorage
 */
export const saveScore = (score: Omit<GameScore, 'id' | 'date'>): GameScore => {
  const scoreWithId: GameScore = {
    ...score,
    id: uuidv4(),
    date: Date.now(),
  };
  
  // Get existing scores
  const scores = getScores();
  
  // Add new score
  scores.push(scoreWithId);
  
  // Save to localStorage
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
      console.log('Score saved successfully:', scoreWithId);
    } else {
      console.warn('localStorage not available, score not saved');
    }
  } catch (error) {
    console.error('Error saving score to localStorage:', error);
  }
  
  return scoreWithId;
};

/**
 * Get all saved scores from localStorage
 */
export const getScores = (): GameScore[] => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, returning empty scores');
      return [];
    }
    
    const scoresJson = localStorage.getItem(SCORES_KEY);
    if (!scoresJson) return [];
    
    const parsedScores = JSON.parse(scoresJson);
    console.log(`Retrieved ${parsedScores.length} scores from localStorage`);
    return parsedScores;
  } catch (error) {
    console.error('Error getting scores from localStorage:', error);
    return [];
  }
};

/**
 * Get scores filtered by difficulty
 */
export const getScoresByDifficulty = (difficulty: Difficulty): GameScore[] => {
  const scores = getScores();
  return scores.filter(score => score.difficulty === difficulty);
};

/**
 * Get top scores (fastest times) by difficulty
 */
export const getTopScores = (difficulty: Difficulty, limit = 10): GameScore[] => {
  const scores = getScoresByDifficulty(difficulty);
  return scores
    .sort((a, b) => a.time - b.time)
    .slice(0, limit);
};

/**
 * Clear all scores
 */
export const clearScores = (): void => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(SCORES_KEY);
      console.log('Scores cleared successfully');
    } else {
      console.warn('localStorage not available, could not clear scores');
    }
  } catch (error) {
    console.error('Error clearing scores from localStorage:', error);
  }
};

/**
 * Save game settings to localStorage
 */
export const saveSettings = (settings: GameSettings): void => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log('Settings saved successfully');
    } else {
      console.warn('localStorage not available, settings not saved');
    }
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

/**
 * Get saved game settings from localStorage
 */
export const getSettings = (): GameSettings => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, returning default settings');
      return DEFAULT_SETTINGS;
    }
    
    const settingsJson = localStorage.getItem(SETTINGS_KEY);
    if (!settingsJson) return DEFAULT_SETTINGS;
    
    const parsedSettings = JSON.parse(settingsJson);
    console.log('Settings retrieved successfully');
    return parsedSettings;
  } catch (error) {
    console.error('Error getting settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}; 