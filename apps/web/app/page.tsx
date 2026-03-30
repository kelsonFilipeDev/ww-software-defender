import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>WW Software Defender</h1>
      <p>Sistema de Monitorização Forense Inteligente</p>
      <nav style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/events">Eventos</Link>
        <Link href="/audit">Auditoria</Link>
      </nav>
    </main>
  );
}
