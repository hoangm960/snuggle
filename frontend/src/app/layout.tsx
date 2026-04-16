import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Snuggle',
  description: 'Pet adoption platform',
  icons: {
    icon: '/images/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}