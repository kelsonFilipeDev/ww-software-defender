'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { auditService, authService, setAuthToken } from '../../src/services/api';

interface AuditLog {
  id: string;
  entityId: string;
  score: number;
  state: string;
  action: string;
  status: string;
  correlationId: string | null;
  createdAt: string;
}

const REFRESH_INTERVAL = 30000;

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [filter, setFilter] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const token = await authService.getToken('dashboard');
      setAuthToken(token);
      const data = await auditService.getAll();
      setLogs(data);
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

  const filtered = filter
    ? logs.filter((l) => l.entityId.includes(filter) || l.state.includes(filter) || l.action.includes(filter))
    : logs;

  const scoreColor = (score: number) => {
    if (score > 80) return 'var(--risk-blocked)';
    if (score > 60) return 'var(--risk-critical)';
    if (score > 40) return 'var(--risk-high)';
    if (score > 20) return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
      {'> LOADING AUDIT TRAIL...'}<span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
    </div>
  );

  if (error) return <div style={{ padding: '2rem', color: 'var(--red-bright)', fontSize: '1rem' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
            {'> FORENSIC AUDIT TRAIL'}
          </div>
          <h1 className="glitch" data-text="AUDIT LOGS" style={{ fontSize: '2rem', letterSpacing: '0.15em' }}>
            AUDIT LOGS
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

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'TOTAL DECISÕES', value: logs.length, color: 'var(--text-primary)' },
          { label: 'BLOQUEADAS', value: logs.filter((l) => l.action === 'BLOCK').length, color: 'var(--risk-blocked)' },
          { label: 'THROTTLED', value: logs.filter((l) => l.action === 'THROTTLE').length, color: 'var(--risk-medium)' },
          { label: 'PERMITIDAS', value: logs.filter((l) => l.action === 'ALLOW').length, color: 'var(--risk-low)' },
        ].map((metric, i) => (
          <motion.div key={metric.label} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{metric.label}</div>
            <div style={{ fontSize: '2rem', color: metric.color, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '1px solid var(--border-red)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.1em' }}>{'> FILTER:'}</span>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="entidade, estado ou acção..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.85rem',
              flex: 1,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{filtered.length} resultados</span>
        </div>
      </motion.div>

      {/* Audit table */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1.25rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
          {'> '}{filtered.length} REGISTOS DE AUDITORIA
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ fontSize: '0.85rem' }}>ENTIDADE</th>
              <th style={{ fontSize: '0.85rem' }}>SCORE</th>
              <th style={{ fontSize: '0.85rem' }}>ESTADO</th>
              <th style={{ fontSize: '0.85rem' }}>ACÇÃO</th>
              <th style={{ fontSize: '0.85rem' }}>STATUS</th>
              <th style={{ fontSize: '0.85rem' }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <td style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{log.entityId}</td>
                <td style={{ color: scoreColor(log.score), fontWeight: 700, fontSize: '0.9rem' }}>{log.score}</td>
                <td><span className={`badge badge-${log.state.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{log.state}</span></td>
                <td><span className={`badge badge-${log.action.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{log.action}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{log.status}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString('pt')}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
