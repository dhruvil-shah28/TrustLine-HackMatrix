import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import ClerkWrapper from '@/components/ClerkWrapper';
import { IBM_Plex_Sans, IBM_Plex_Mono, Source_Sans_3 } from 'next/font/google';

const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-plex-sans' });
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-plex-mono' });
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
});

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
      <body className={`app-shell min-h-screen flex flex-col antialiased ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
        <ClerkWrapper>
          <ClientProviders typographyClassName={sourceSans3.variable}>{children}</ClientProviders>
        </ClerkWrapper>
      </body>
    </html>
  );
}
