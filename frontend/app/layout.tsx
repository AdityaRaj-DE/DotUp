import './globals.css';
import type { Viewport } from 'next';

export const metadata = {
  title: 'DotUp V3',
  description: 'DotUp V3 Platform Foundation',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
