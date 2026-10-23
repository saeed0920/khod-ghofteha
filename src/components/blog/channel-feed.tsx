import Link from 'next/link';
import { channel } from '@/lib/shared';
import { formatDate, formatTime, type Post } from '@/lib/blog';
import { Dot, TelegramIcon } from './telegram-icon';

/** Latest channel messages = latest posts (every post is a channel message). */
export function ChannelFeed({ posts }: { posts: Post[] }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-[20px] bg-channel p-4 md:gap-3 md:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-white">
          <TelegramIcon size={20} />
        </span>
        <div className="flex-1">
          <h2 className="text-[15px] font-bold">تازه در کانال</h2>
          <span dir="ltr" className="text-xs text-muted">
            @{channel.handle}
          </span>
        </div>
      </div>
      {posts.slice(0, 3).map((p) => (
        <Link key={p.url} href={p.url} className="bubble block bg-surface px-3 py-2.5 text-sm hover:bg-card md:px-3.5">
          <p className="line-clamp-2 leading-[1.9] text-ink-soft">{p.data.title}</p>
          <span className="text-xs text-muted">
            {formatDate(p.data.date)} <Dot /> {formatTime(p.data.date)}
          </span>
        </Link>
      ))}
      <a
        href={channel.url}
        target="_blank"
        rel="noopener"
        className="flex min-h-12 items-center justify-center rounded-xl bg-accent text-[15px] font-semibold text-white hover:bg-accent-strong md:min-h-11 md:text-sm"
      >
        عضویت در کانال
      </a>
    </section>
  );
}
