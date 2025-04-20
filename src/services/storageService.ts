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
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  
  return scoreWithId;
};

/**
 * Get all saved scores from localStorage
 */
export const getScores = (): GameScore[] => {
  const scoresJson = localStorage.getItem(SCORES_KEY);
  if (!scoresJson) return [];
  
  try {
    return JSON.parse(scoresJson);
  } catch (error) {
    console.error('Error parsing scores from localStorage', error);
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
  localStorage.removeItem(SCORES_KEY);
};

/**
 * Save game settings to localStorage
 */
export const saveSettings = (settings: GameSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * Get saved game settings from localStorage
 */
export const getSettings = (): GameSettings => {
  const settingsJson = localStorage.getItem(SETTINGS_KEY);
  if (!settingsJson) return DEFAULT_SETTINGS;
  
  try {
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Error parsing settings from localStorage', error);
    return DEFAULT_SETTINGS;
  }
}; 