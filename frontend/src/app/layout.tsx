import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Snuggles',
  description: 'Pet adoption platform',
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