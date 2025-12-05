import './globals.css';
import type { Metadata } from 'next';
import LogoutButton from '@/components/LogoutButton';

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
      <body>
        <LogoutButton />
        {children}
      </body>
    </html>
  );
}

