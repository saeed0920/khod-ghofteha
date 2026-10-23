import Link from 'next/link';
import { channel } from '@/lib/shared';
import { formatDate, formatTime, getPostById, type Post } from '@/lib/blog';
import { getLatestChannelMessages } from '@/lib/telegram-feed';
import { Dot, TelegramIcon } from './telegram-icon';

const bubble = 'bubble block bg-surface px-3 py-2.5 text-sm hover:bg-card md:px-3.5';

/** Live channel messages (build-time fetch of t.me/s); falls back to latest imported posts. */
export async function ChannelFeed({ posts }: { posts: Post[] }) {
  const live = await getLatestChannelMessages();
  const items = live.length
    ? live.map((m) => {
        const post = getPostById(m.id);
        return { key: m.id, text: m.text.replace(/\n{2,}/g, "\n"), date: m.date, forwarded: m.forwarded, href: post?.url, external: post ? undefined : `${channel.url}/${m.id}` };
      })
    : posts.slice(0, 3).map((p) => ({ key: p.url, text: p.data.title, date: p.data.date, forwarded: false, href: p.url, external: undefined }));

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
      {items.map((it) => {
        const body = (
          <>
            {it.forwarded && <span className="block text-[11px] font-medium text-chip-ink">بازنشر</span>}
            <p className="line-clamp-3 leading-[1.9] whitespace-pre-line text-ink-soft">{it.text}</p>
            <span className="text-xs text-muted">
              {formatDate(it.date)} <Dot /> {formatTime(it.date)}
            </span>
          </>
        );
        return it.href ? (
          <Link key={it.key} href={it.href} className={bubble}>
            {body}
          </Link>
        ) : (
          <a key={it.key} href={it.external} target="_blank" rel="noopener" className={bubble}>
            {body}
          </a>
        );
      })}
    </section>
  );
}
