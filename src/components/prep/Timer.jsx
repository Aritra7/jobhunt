import React, { useEffect } from 'react';

const TARGET_SECONDS = 120;

/** @param {number} s */
function mmss(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Answer timer with a 2-minute target (a typical spoken answer length).
 * @param {{ running: boolean, seconds: number, onTick: (seconds: number) => void }} props
 */
export default function Timer({ running, seconds, onTick }) {
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => onTick(seconds + 1), 1000);
    return () => clearInterval(id);
  }, [running, seconds, onTick]);

  const over = seconds > TARGET_SECONDS;
  return (
    <span className={over ? 'timer over' : 'timer'} aria-live="off">
      ⏱ {mmss(seconds)} <span className="muted">/ {mmss(TARGET_SECONDS)}</span>
    </span>
  );
}
