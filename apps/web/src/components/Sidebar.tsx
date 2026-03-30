'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: '// DASHBOARD' },
  { href: '/events', label: '// EVENTOS' },
  { href: '/audit', label: '// AUDITORIA' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-red)',
      padding: '2rem 0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <div style={{
          color: 'var(--red-primary)',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          marginBottom: '0.25rem',
        }}>WW SOFTWARE</div>
        <div style={{
          color: 'var(--text-primary)',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}>DEFENDER</div>
        <div style={{
          width: '100%',
          height: '1px',
          background: 'var(--red-dim)',
          marginTop: '1rem',
        }} />
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: pathname === link.href ? 'var(--red-bright)' : 'var(--text-secondary)',
              background: pathname === link.href ? 'var(--red-glow)' : 'transparent',
              borderLeft: pathname === link.href ? '2px solid var(--red-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div style={{
        marginTop: 'auto',
        padding: '1.5rem',
        fontSize: '0.65rem',
        color: 'var(--text-dim)',
      }}>
        <div>SISTEMA ACTIVO</div>
        <div style={{ color: 'var(--green)', marginTop: '0.25rem' }}>● ONLINE</div>
      </div>
    </aside>
  );
}
