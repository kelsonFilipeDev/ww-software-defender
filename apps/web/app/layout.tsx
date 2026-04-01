'use client';

import { useState } from 'react';
import Sidebar from '../src/components/Sidebar';
import BootScreen from '../src/components/BootScreen';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [booted, setBooted] = useState(false);

  return (
    <html lang="pt">
      <body style={{ display: 'flex' }}>
        {!booted && <BootScreen onComplete={() => setBooted(true)} />}
        <Sidebar />
        <main style={{
          marginLeft: '220px',
          flex: 1,
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          opacity: booted ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
