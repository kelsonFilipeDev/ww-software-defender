'use client';

import { useEffect, useRef, useState } from 'react';

interface Log {
  id: string;
  score: number;
}

export default function ScoreTimeline({ logs }: { logs: Log[] }) {
  const [progress, setProgress] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    animated.current = true;

    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(eased);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  const data = logs.slice(0, 15).reverse();
  const max = 100;
  const width = 100;
  const height = 60;

  const allPoints = data.map((log, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * width,
    y: height - (log.score / max) * height,
    id: log.id,
  }));

  const visibleCount = Math.max(2, Math.round(allPoints.length * progress));
  const points = allPoints.slice(0, visibleCount);
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '140px' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cc0000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#cc0000" stopOpacity="0" />
        </linearGradient>
      </defs>
      {points.length > 1 && lastPoint && (
        <>
          <polygon
            points={`0,${height} ${pointsStr} ${lastPoint.x},${height}`}
            fill="url(#grad)"
          />
          <polyline points={pointsStr} fill="none" stroke="#cc0000" strokeWidth="1.5" />
        </>
      )}
      {points.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r="1.5" fill="#cc0000" />
      ))}
    </svg>
  );
}
