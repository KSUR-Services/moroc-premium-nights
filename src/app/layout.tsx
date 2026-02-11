import { ReactNode } from 'react';

export const metadata = {
  title: 'Moroc Premium Nights',
  description: 'Discover the finest nightlife and dining in Morocco',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
