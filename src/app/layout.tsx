import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'UNO Multiplayer',
  description: 'Play UNO online with friends in real time.',
  keywords: ['UNO', 'multiplayer', 'card game', 'online', 'friends'],
  openGraph: {
    title: 'UNO Multiplayer',
    description: 'Play UNO online with friends',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>U</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-uno-dark">
        {children}
      </body>
    </html>
  );
}
