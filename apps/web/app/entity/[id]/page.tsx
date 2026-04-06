'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  auditService,
  eventsService,
  riskService,
  stateService,
  authService,
  setAuthToken,
} from '../../../src/services/api';

interface Event {
  id: string;
  entityId: string;
  type: string;
  ip: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  entityId: string;
  score: number;
  state: string;
  action: string;
  status: string;
  createdAt: string;
}

interface RiskData {
  entityId: string;
  score: number;
  createdAt: string;
}

interface StateData {
  entityId: string;
  state: string;
  updatedAt: string;
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

export default function EntityDrillDownPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [state, setState] = useState<StateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await authService.getToken('dashboard');
      setAuthToken(token);
      const [eventsData, auditData, riskData, stateData] = await Promise.all([
        eventsService.getByEntityId(id),
        auditService.getByEntityId(id),
        riskService.getByEntityId(id),
        stateService.getByEntityId(id),
      ]);
      setEvents(eventsData);
      setAuditLogs(auditData);
      setRisk(riskData);
      setState(stateData);
      setError('');
    } catch {
      setError('ERROR: Failed to load entity data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
      {'> LOADING ENTITY DATA...'}<span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
    </div>
  );

  if (error) return <div style={{ padding: '2rem', color: 'var(--red-bright)' }}>{error}</div>;

  const currentState = state?.state ?? 'UNKNOWN';
  const currentScore = risk?.score ?? 0;
  const stateColor = STATE_COLORS[currentState] ?? 'var(--text-secondary)';

  return (
    <div style={{ padding: '2rem' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1rem', padding: 0 }}
        >
          {'< BACK'}
        </button>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
          {'> ENTITY FORENSIC VIEW'}
        </div>
        <h1 className="glitch" data-text={id} style={{ fontSize: '2rem', letterSpacing: '0.15em' }}>
          {id}
        </h1>
      </motion.div>

      {/* State & Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>CURRENT STATE</div>
          <div style={{ fontSize: '2rem', color: stateColor, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{currentState}</div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>RISK SCORE</div>
          <div style={{ fontSize: '2rem', color: currentScore > 60 ? 'var(--red-bright)' : currentScore > 20 ? 'var(--yellow)' : 'var(--green)', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{currentScore}</div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>TOTAL EVENTS</div>
          <div style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{events.length}</div>
        </motion.div>
      </div>

      {/* Event Timeline */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1.25rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> EVENT TIMELINE'}</div>
        {events.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No events recorded.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ fontSize: '0.85rem' }}>TYPE</th>
                <th style={{ fontSize: '0.85rem' }}>IP</th>
                <th style={{ fontSize: '0.85rem' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ color: 'var(--red-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{ev.type}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{ev.ip}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{new Date(ev.createdAt).toLocaleString('en')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Decision History */}
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1.25rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{'> DECISION HISTORY'}</div>
        {auditLogs.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No decisions recorded.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ fontSize: '0.85rem' }}>SCORE</th>
                <th style={{ fontSize: '0.85rem' }}>STATE</th>
                <th style={{ fontSize: '0.85rem' }}>ACTION</th>
                <th style={{ fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ fontSize: '0.85rem' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: log.score > 60 ? 'var(--red-bright)' : log.score > 20 ? 'var(--yellow)' : 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>{log.score}</td>
                  <td><span className={`badge badge-${log.state.toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{log.state}</span></td>
                  <td><span style={{ color: ACTION_COLORS[log.action] ?? 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>{log.action}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.status}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString('en')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

    </div>
  );
}
