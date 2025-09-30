import { useEffect, useState, useRef, useCallback } from 'react';

export default function useTimer(initialSeconds = 0, timerEndAt = null, onExpire = () => {}) {
  const [remaining, setRemaining] = useState(() => {
    if (timerEndAt) {
      return Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
    }
    return initialSeconds;
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  const resume = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  return { remaining, setRemaining, pause, resume };
}

