'use client';

import { useEffect, useRef, useState } from 'react';

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

export default function PieChart({ data }: { data: PieSlice[] }) {
  const [progress, setProgress] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    animated.current = true;

    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return (
    <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', padding: '1rem 0' }}>SEM DADOS</div>
  );

  const cx = 50;
  const cy = 50;
  const r = 38;
  const innerR = 22;

  let cumulative = 0;
  const slices = data.map((d) => {
    const startFraction = cumulative / total;
    cumulative += d.value;
    const endFraction = cumulative / total;

    const animatedEnd = startFraction + (endFraction - startFraction) * progress;
    const startAngle = startFraction * 2 * Math.PI - Math.PI / 2;
    const endAngle = animatedEnd * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = (animatedEnd - startFraction) * 2 * Math.PI > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return { ...d, path, percent: Math.round((d.value / total) * 100) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <svg viewBox="0 0 100 100" style={{ width: '130px', height: '130px', flexShrink: 0 }}>
        {slices.map((s) => (
          <path key={s.name} d={s.path} fill={s.color} opacity={0.85} stroke="var(--bg-card)" strokeWidth="0.5" />
        ))}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--bg-card)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="Share Tech Mono">
          {total}
        </text>
        <text x={cx} y={cy + 7} textAnchor="middle" fill="var(--text-dim)" fontSize="6" fontFamily="Share Tech Mono">
          TOTAL
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        {slices.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '10px', height: '10px', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', flex: 1 }}>{s.name}</span>
            <span style={{ fontSize: '0.8rem', color: s.color, fontWeight: 700 }}>{s.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
