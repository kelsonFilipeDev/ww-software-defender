'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, animate } from 'framer-motion';
import PieChart from '../../src/components/PieChart';
import ScoreTimeline from '../../src/components/ScoreTimeline';
import { auditService, authService, eventsService, setAuthToken } from '../../src/services/api';

interface AuditLog {
  id: string;
  entityId: string;
  score: number;
  state: string;
  action: string;
  status: string;
  createdAt: string;
}

const STATE_COLORS: Record<string, string> = {
  NORMAL: '#00ff41',
  SUSPEITO: '#ffcc00',
  ALERTA: '#ff6600',
  CRITICO: '#cc0000',
  BLOQUEADO: '#ff1111',
};

const ACTION_COLORS: Record<string, string> = {
  ALLOW: '#00ff41',
  THROTTLE: '#ffcc00',
  CHALLENGE: '#ff6600',
  BLOCK: '#cc0000',
};

const REFRESH_INTERVAL = 30000;

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(prevValue.current, value, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => { node.textContent = Math.round(v).toString(); },
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <div ref={ref} style={{ fontSize: '2.5rem', color, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>
      {value}
    </div>
  );
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const router = useRouter();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const token = await authService.getToken('dashboard');
      setAuthToken(token);
      const [auditData, eventsData] = await Promise.all([
        auditService.getAll(),
        eventsService.getAll(),
      ]);
      setLogs(auditData);
      setTotalEvents(eventsData.length);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('ERRO: Falha na ligação ao servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_INTERVAL / 1000);
    }
  }, []);

  useEffect(() => { void load(false); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => { void load(true); }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const latestPerEntity = Object.values(
    logs.reduce<Record<string, AuditLog>>((acc, log) => {
      if (!acc[log.entityId] || new Date(log.createdAt) > new Date(acc[log.entityId]!.createdAt)) {
        acc[log.entityId] = log;
      }
      return acc;
    }, {}),
  );

  const totalEntities = latestPerEntity.length;
  const blocked = latestPerEntity.filter((l) => l.state === 'BLOQUEADO').length;
  const suspicious = latestPerEntity.filter((l) => l.state === 'SUSPEITO').length;
  const alerts = latestPerEntity.filter((l) => l.state === 'ALERTA' || l.state === 'CRITICO').length;
  const normal = latestPerEntity.filter((l) => l.state === 'NORMAL').length;

  const stateData = Object.entries(
    latestPerEntity.reduce<Record<string, number>>((acc, log) => {
      acc[log.state] = (acc[log.state] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value, color: STATE_COLORS[name] ?? '#444' }));

  const actionData = Object.entries(
    latestPerEntity.reduce<Record<string, number>>((acc, log) => {
      acc[log.action] = (acc[log.action] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value, color: ACTION_COLORS[name] ?? '#444' }));

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
      {'> LOADING THREAT DATA...'}<span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
    </div>
  );

  if (error) return <div style={{ padding: '2rem', color: 'var(--red-bright)', fontSize: '1rem' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
            {'> SYSTEM STATUS: '}<span style={{ color: 'var(--green)' }}>ACTIVE</span>
          </div>
          <h1 className="glitch" data-text="THREAT OVERVIEW" style={{ fontSize: '2rem', letterSpacing: '0.15em' }}>
            THREAT OVERVIEW
          </h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
          {refreshing && (
            <div style={{ color: 'var(--red-primary)', marginBottom: '0.25rem', letterSpacing: '0.1em' }}>
              {'> SYNCING...'}<span style={{ animation: 'blink 0.5s infinite' }}>_</span>
            </div>
          )}
          {lastUpdated && (
            <div style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
              LAST SYNC: {lastUpdated.toLocaleTimeString('pt')}
            </div>
          )}
          <div style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            NEXT SYNC: <span style={{ color: countdown <= 10 ? 'var(--red-primary)' : 'var(--text-secondary)' }}>{countdown}s</span>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'ENTITIES', value: totalEntities, color: 'var(--text-primary)', sub: 'monitored' },
          { label: 'SUSPICIOUS', value: suspicious, color: 'var(--yellow)', sub: 'THROTTLE active' },
          { label: 'ON ALERT', value: alerts, color: alerts > 0 ? 'var(--orange)' : 'var(--green)', sub: alerts > 0 ? 'CHALLENGE/BLOCK' : 'system secure' },
          { label: 'BLOCKED', value: blocked, color: 'var(--red-bright)', sub: 'access denied' },
        ].map((metric, i) => (
          <motion.div key={metric.label} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{metric.label}</div>
            <AnimatedNumber value={metric.value} color={metric.color} />
            <div style={{ fontSize: '0.7rem', color: metric.sub === 'system secure' ? 'var(--green)' : 'var(--text-dim)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>{metric.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>NORMAL ENTITIES</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--green)', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{normal}</div>
          </div>
          <div style={{ fontSize: '2rem', color: 'var(--green)', opacity: 0.3 }}>●</div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', fontFamily: 'Rajdhani, sans-serif' }}>TOTAL EVENTS</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{totalEvents}</div>
          </div>
          <div style={{ fontSize: '2rem', color: 'var(--red-primary)', opacity: 0.3 }}>◈</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> RISK SCORE — LATEST ACTIONS'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Risk score per audited entity (0–100)</div>
          <ScoreTimeline logs={latestPerEntity.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            <span>NORMAL (0)</span>
            <span style={{ color: 'var(--yellow)' }}>SUSPICIOUS (21)</span>
            <span style={{ color: 'var(--orange)' }}>ALERT (41)</span>
            <span style={{ color: 'var(--red-bright)' }}>CRITICAL (81)</span>
          </div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> STATES'}</div>
          <PieChart data={stateData} />
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> ACTIONS'}</div>
          <PieChart data={actionData} />
        </motion.div>
      </div>

      {/* Recent Logs */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1.25rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> RECENT AUDIT LOGS'}</div>
        <table>
          <thead>
            <tr>
              <th style={{ fontSize: '0.85rem' }}>ENTITY</th>
              <th style={{ fontSize: '0.85rem' }}>SCORE</th>
              <th style={{ fontSize: '0.85rem' }}>STATE</th>
              <th style={{ fontSize: '0.85rem' }}>ACTION</th>
              <th style={{ fontSize: '0.85rem' }}>TIMESTAMP</th>
              <th style={{ fontSize: '0.85rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 10).map((log) => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{log.entityId}</td>
                <td style={{ color: log.score > 60 ? 'var(--red-bright)' : log.score > 20 ? 'var(--yellow)' : 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>{log.score}</td>
                <td><span className={`badge badge-${log.state.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{log.state}</span></td>
                <td><span className={`badge badge-${log.action.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{log.action}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString('pt')}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => router.push(`/entity/${log.entityId}`)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', lineHeight: 0 }}
                    title="View entity"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}