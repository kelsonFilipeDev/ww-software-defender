'use client';

import { useEffect, useState } from 'react';

const lines = [
  '> INITIALIZING WW SOFTWARE DEFENDER...',
  '> CONNECTING TO SECURE DATABASE...',
  '> LOADING THREAT INTELLIGENCE ENGINE...',
  '> ESTABLISHING ENCRYPTED CHANNEL...',
  '> SYSTEM READY.',
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setVisibleLines((prev) => [...prev, lines[i] ?? '']);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 500);
        }, 500);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: done ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <div style={{
          color: 'var(--red-primary)',
          fontSize: '1.2rem',
          letterSpacing: '0.2em',
          marginBottom: '2rem',
          fontWeight: 700,
        }}>
          WW SOFTWARE DEFENDER
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {visibleLines.map((line, i) => (
            <div key={i} style={{
              color: i === visibleLines.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              animation: 'scanIn 0.2s ease forwards',
            }}>
              {line}
              {i === visibleLines.length - 1 && !done && (
                <span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
