import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import { getSettings } from '@/lib/googleSheets';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '従業員アンケートシステム',
  description: 'Employee Survey System',
};

// Layout is a Server Component, so we can fetch settings here
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organizationName = '';
  try {
    const settings = await getSettings();
    organizationName = settings.name;
  } catch (e) {
    console.error('Failed to fetch settings for layout', e);
  }

  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header organizationName={organizationName} />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
