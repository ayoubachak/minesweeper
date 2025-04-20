/**
 * Utility functions for time formatting
 */

/**
 * Format time in milliseconds to mm:ss
 * @param ms Time in milliseconds
 * @returns Formatted time string in mm:ss format
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}; 