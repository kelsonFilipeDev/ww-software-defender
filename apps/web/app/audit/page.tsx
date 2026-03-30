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
  createdAt: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const token = await authService.getToken('dashboard');
      setAuthToken(token);
      const data = await auditService.getAll();
      setLogs(data);
    } catch {
      setError('ERRO: Falha na ligação ao servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        {'> LOADING AUDIT LOGS...'}<span style={{ animation: 'blink 1s infinite', color: 'var(--red-primary)' }}>_</span>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'var(--red-bright)', fontSize: '0.8rem' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: '0.25rem' }}>
          {'> FORENSIC AUDIT TRAIL'}
        </div>
        <h1 className="glitch" data-text="AUDIT LOGS" style={{ fontSize: '1.5rem', letterSpacing: '0.15em' }}>
          AUDIT LOGS
        </h1>
      </motion.div>

      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--red-primary)', letterSpacing: '0.15em', marginBottom: '1rem' }}>
          {'> '}{logs.length} REGISTOS ENCONTRADOS
        </div>
        <table>
          <thead>
            <tr>
              <th>ENTIDADE</th>
              <th>SCORE</th>
              <th>ESTADO</th>
              <th>ACÇÃO</th>
              <th>STATUS</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td style={{ color: 'var(--text-primary)' }}>{log.entityId}</td>
                <td style={{
                  color: log.score > 60 ? 'var(--risk-critical)' :
                    log.score > 40 ? 'var(--risk-high)' :
                    log.score > 20 ? 'var(--risk-medium)' : 'var(--risk-low)',
                  fontWeight: 700,
                }}>
                  {log.score}
                </td>
                <td><span className={`badge badge-${log.state.toLowerCase()}`}>{log.state}</span></td>
                <td><span className={`badge badge-${log.action.toLowerCase()}`}>{log.action}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{log.status}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  {new Date(log.createdAt).toLocaleString('pt')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
