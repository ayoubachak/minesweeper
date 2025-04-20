import React, { useEffect, useState } from 'react';
import { Text, useColorModeValue } from '@chakra-ui/react';

interface TimerProps {
  isRunning: boolean;
  startTime: number | null;
  endTime: number | null;
}

const Timer: React.FC<TimerProps> = ({ isRunning, startTime, endTime }) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const textColor = useColorModeValue('gray.800', 'white');
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (isRunning && startTime) {
      // Start the timer
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
    } else if (!isRunning && startTime && endTime) {
      // Game is over, show final time
      const elapsed = Math.floor((endTime - startTime) / 1000);
      setTimeElapsed(elapsed);
    } else {
      // Reset timer
      setTimeElapsed(0);
    }
    
    // Cleanup
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isRunning, startTime, endTime]);
  
  // Format time as minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  return (
    <Text fontWeight="bold" color={textColor} fontFamily="monospace" minWidth="55px">
      {formatTime(timeElapsed)}
    </Text>
  );
};

export default Timer; 