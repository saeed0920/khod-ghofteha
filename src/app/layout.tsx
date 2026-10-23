import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { appDescription, appName } from '@/lib/shared';
import './global.css';

const font = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
});

export const metadata: Metadata = {
  title: { default: appName, template: `%s · ${appName}` },
  description: appDescription,
};

export const viewport: Viewport = { themeColor: '#F7F9FA', colorScheme: 'light' };

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fa" dir="rtl" className={font.variable}>
      <body className="flex min-h-screen flex-col">
        {/* Light theme only (no `.dark` class ever). Fumadocs search dialog off: Ctrl/⌘K focuses home search (SiteHeader). */}
        <RootProvider dir="rtl" theme={{ enabled: false }} search={{ enabled: false }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
