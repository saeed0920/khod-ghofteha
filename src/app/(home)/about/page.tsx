import type { Metadata } from 'next';
import { TelegramIcon } from '@/components/blog/telegram-icon';
import { appDescription, appName, channel } from '@/lib/shared';

export const metadata: Metadata = { title: 'درباره' };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 pt-7 pb-4 md:px-6 md:pt-12 md:pb-20">
      <h1 className="mb-4 text-[26px] leading-[1.6] font-bold md:text-4xl">دربارهٔ {appName}</h1>
      <div className="post-body">
        <p>{appDescription}.</p>
      </div>
      <a
        href={channel.url}
        target="_blank"
        rel="noopener"
        className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-semibold text-white hover:bg-accent-strong"
      >
        <TelegramIcon />
        <span dir="ltr">@{channel.handle}</span>
      </a>
    </main>
  );
}
