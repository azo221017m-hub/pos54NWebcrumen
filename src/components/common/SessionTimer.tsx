import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getToken, getTimeUntilExpiration, formatTimeRemaining } from '../../services/sessionService';
import './SessionTimer.css';

// Warning threshold: 2 minutes in milliseconds
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 120000ms

export const SessionTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const token = getToken();
      if (token) {
        const remaining = getTimeUntilExpiration(token);
        setTimeRemaining(remaining);
        
        // Show warning when less than 2 minutes remaining
        setIsWarning(remaining > 0 && remaining <= WARNING_THRESHOLD_MS);
      } else {
        setTimeRemaining(0);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeRemaining <= 0) {
    return null;
  }

  return (
    <div className={`session-timer ${isWarning ? 'warning' : ''}`}>
      <Clock size={16} />
      <span className="timer-text">Sesión: {formatTimeRemaining(timeRemaining)}</span>
    </div>
  );
};
