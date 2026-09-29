import { useState } from 'react';

// State for the practice-answer timer; <Timer> does the ticking.
export default function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  return {
    seconds, running, setSeconds,
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: () => { setRunning(false); setSeconds(0); },
  };
}
