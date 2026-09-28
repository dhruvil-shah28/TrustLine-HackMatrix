import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'TRUSTLINE | Financial Crime & Insider Risk Intelligence Platform',
  description: 'Evidence-first financial crime and insider risk intelligence platform connecting people, permissions, accounts, and transactions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-shell min-h-screen flex flex-col antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

