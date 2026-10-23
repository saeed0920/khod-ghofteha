import Link from 'next/link';
import type { PostSummary } from '@/lib/blog';
import { Dot } from './telegram-icon';

export function PostCard({ post, onTag }: { post: PostSummary; onTag?: (tag: string) => void }) {
  return (
    <article className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-card p-[18px] md:gap-3.5 md:p-[26px]">
      <div className="text-xs font-medium text-muted md:text-[13px]">{post.date}</div>
      <h3 className="text-[19px] leading-[1.7] font-bold md:text-2xl md:leading-[1.65]">
        <Link href={post.url} className="text-ink hover:text-accent-strong">
          {post.title}
        </Link>
      </h3>
      {post.description && (
        <p className="text-[15px] leading-[2] text-muted md:text-base md:leading-[2.05]">{post.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-subtle md:gap-2 md:text-[13px]">
        {post.tags.map((t) =>
          onTag ? (
            <button
              key={t}
              type="button"
              onClick={() => onTag(t)}
              className="cursor-pointer rounded-full bg-chip-soft px-2.5 py-1 text-chip-ink hover:bg-chip"
            >
              #{t}
            </button>
          ) : (
            <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="rounded-full bg-chip-soft px-2.5 py-1 text-chip-ink hover:bg-chip">
              #{t}
            </Link>
          ),
        )}
        <span>
          <Dot />
          {post.minutes} دقیقه مطالعه
        </span>
        <span className="flex-1" />
        <Link href={post.url} className="py-2 text-sm font-semibold text-accent hover:text-accent-strong" aria-label={`ادامهٔ مطلب: ${post.title}`}>
          ادامهٔ مطلب ←
        </Link>
      </div>
    </article>
  );
}
