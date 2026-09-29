import React, { useState } from 'react';

const RESET_MS = 1500;

/**
 * @param {{ text: string, label?: string, className?: string }} props
 */
export default function CopyButton({ text, label = 'Copy', className = 'secondary-button small' }) {
  const [state, setState] = useState('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), RESET_MS);
  };

  return (
    <button type="button" className={className} onClick={copy} disabled={!text}>
      {state === 'copied' ? 'Copied ✓' : state === 'failed' ? 'Copy failed' : label}
    </button>
  );
}
