import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🎄 Noel - Christmas Game',
  description: 'Christmas themed challenge and reward game',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

