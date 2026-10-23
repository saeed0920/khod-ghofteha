'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { appName, channel } from '@/lib/shared';
import { TelegramIcon } from './telegram-icon';

const links = [
  { href: '/', label: 'خانه' },
  { href: '/blog', label: 'بایگانی' },
  { href: '/about', label: 'درباره' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const router = useRouter();

  // Ctrl/⌘K: focus the home page search (no modal); from other pages go there first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) return;
      e.preventDefault();
      const input = document.getElementById('search');
      if (input) input.focus();
      else router.push('/#search');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  // Close the mobile menu after navigating.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-[#dce3e7] bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-2.5 md:gap-6 md:px-6 md:py-4">
        <Link href="/" className="text-lg font-bold text-ink md:text-xl">
          {appName}
          <span className="text-accent">.</span>
        </Link>

        <nav aria-label="منوی اصلی" className="hidden gap-1 text-[15px] md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? 'page' : undefined}
              className="rounded-lg px-3 py-2.5 text-[#52626e] hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {pathname !== '/' && (
          <Link
            href="/#search"
            className="hidden min-h-11 min-w-[220px] items-center gap-2.5 rounded-xl bg-card px-3.5 text-sm text-subtle shadow-[0_2px_8px_rgba(30,42,51,0.05)] hover:text-ink lg:flex"
          >
            <Search size={17} aria-hidden />
            <span className="flex-1">جستجو…</span>
          </Link>
        )}

        <a
          href={channel.url}
          target="_blank"
          rel="noopener"
          className="hidden min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong md:flex"
        >
          <TelegramIcon />
          عضویت در کانال
        </a>

        {/* Mobile */}
        <a
          href={channel.url}
          target="_blank"
          rel="noopener"
          aria-label="کانال تلگرام"
          className="flex size-11 items-center justify-center rounded-xl bg-accent text-white md:hidden"
        >
          <TelegramIcon size={19} />
        </a>
        <details ref={menu} className="group md:hidden">
          <summary
            aria-label="منو"
            className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-line-strong bg-card text-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu size={20} className="group-open:hidden" aria-hidden />
            <X size={20} className="hidden group-open:block" aria-hidden />
          </summary>
          <nav
            aria-label="منوی اصلی"
            className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-[#dce3e7] bg-surface p-3 shadow-[0_12px_24px_rgba(30,42,51,0.08)]"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className="flex min-h-12 items-center rounded-xl px-4 text-[15px] text-muted aria-[current=page]:bg-chip-soft aria-[current=page]:font-semibold aria-[current=page]:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#search" className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-[15px] text-muted">
              <Search size={17} aria-hidden />
              جستجو
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
