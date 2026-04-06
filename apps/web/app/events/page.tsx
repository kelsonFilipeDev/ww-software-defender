'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { eventsService, authService, setAuthToken } from '../../src/services/api';

interface Event {
  id: string;
  type: string;
  entityId: string;
  payload: Record<string, unknown>;
  correlationId: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  LoginFailed: '#ffcc00',
  LoginFailedRepeat: '#ff6600',
  SuspiciousIp: '#cc0000',
  PasswordReset: '#ff1111',
};

const REFRESH_INTERVAL = 30000;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
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
      const data = await eventsService.getAll();
      setEvents(data);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('ERROR: Failed to connect to server.');
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
    ? events.filter((e) => e.entityId.includes(filter) || e.type.includes(filter))
    : events;

  const typeCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
      {'> LOADING EVENT STREAM...'}<span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
    </div>
  );

  if (error) return <div style={{ padding: '2rem', color: 'var(--red-bright)', fontSize: '1rem' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
            {'> FORENSIC EVENT STREAM'}
          </div>
          <h1 className="glitch" data-text="EVENT LOG" style={{ fontSize: '2rem', letterSpacing: '0.15em' }}>
            EVENT LOG
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
              LAST SYNC: {lastUpdated.toLocaleTimeString('en')}
            </div>
          )}
          <div style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            NEXT SYNC: <span style={{ color: countdown <= 10 ? 'var(--red-primary)' : 'var(--text-secondary)' }}>{countdown}s</span>
          </div>
        </div>
      </motion.div>

      {/* Type summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(typeCounts).map(([type, count], i) => (
          <motion.div key={type} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{type}</div>
            <div style={{ fontSize: '2rem', color: TYPE_COLORS[type] ?? 'var(--text-primary)', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{count}</div>
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
            placeholder="entity or type..."
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{filtered.length} results</span>
        </div>
      </motion.div>

      {/* Events table */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1.25rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
          {'> '}{filtered.length} EVENTS RECORDED
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ fontSize: '0.85rem' }}>TYPE</th>
              <th style={{ fontSize: '0.85rem' }}>ENTITY</th>
              <th style={{ fontSize: '0.85rem' }}>PAYLOAD</th>
              <th style={{ fontSize: '0.85rem' }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event, i) => (
              <motion.tr key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                <td>
                  <span style={{
                    color: TYPE_COLORS[event.type] ?? 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    letterSpacing: '0.05em',
                  }}>
                    {event.type}
                  </span>
                </td>
                <td style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{event.entityId}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'Share Tech Mono, monospace' }}>
                  {JSON.stringify(event.payload)}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {new Date(event.createdAt).toLocaleString('en')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}