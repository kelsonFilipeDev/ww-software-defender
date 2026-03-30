'use client';

import { useEffect, useState } from 'react';
import { eventsService, authService, setAuthToken } from '../../src/services/api';

interface Event {
  id: string;
  type: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = await authService.getToken('dashboard');
        setAuthToken(token);
        const data = await eventsService.getAll();
        setEvents(data);
      } catch {
        setError('Erro ao carregar eventos.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <p style={{ padding: '2rem' }}>A carregar...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Eventos</h1>
      <p>Total: {events.length}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Tipo</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Entidade</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Payload</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Data</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td style={{ padding: '0.5rem' }}>{event.type}</td>
              <td style={{ padding: '0.5rem' }}>{event.entityId}</td>
              <td style={{ padding: '0.5rem' }}>{JSON.stringify(event.payload)}</td>
              <td style={{ padding: '0.5rem' }}>{new Date(event.createdAt).toLocaleString('pt')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
