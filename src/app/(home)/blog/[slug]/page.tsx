import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { PostToc } from '@/components/blog/toc';
import { Dot, TelegramIcon } from '@/components/blog/telegram-icon';
import { blog, faNum, formatDate, formatTime, getPostById, getPosts, readingMinutes, type Post } from '@/lib/blog';

function related(post: Post, all: Post[]) {
  return all
    .filter((p) => p !== post)
    .map((p) => ({ p, score: p.data.tags.filter((t) => post.data.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, 3)
    .map((x) => x.p);
}

function RelatedLink({ post }: { post: Post }) {
  return (
    <Link href={post.url} className="block leading-[1.8] text-ink hover:text-accent-strong">
      <span className="line-clamp-2">{post.data.title}</span>
      <span className="block text-xs text-subtle">
        {formatDate(post.data.date, true)} <Dot /> {faNum(readingMinutes(post))} دقیقه
      </span>
    </Link>
  );
}

export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = blog.getPage([slug]);
  if (!post) notFound();

  const all = getPosts();
  const i = all.indexOf(post);
  const newer = all[i - 1];
  const older = all[i + 1];
  const rel = related(post, all);
  const replyTo = post.data.replyTo ? getPostById(post.data.replyTo) : undefined;
  const { date, telegram, tags, toc } = post.data;
  const MDX = post.data.body;

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 pt-6 pb-4 md:px-6 md:pt-12 md:pb-20 lg:grid-cols-[minmax(0,760px)_minmax(260px,1fr)] lg:items-start lg:gap-12">
      <article className="min-w-0">
        <p className="hidden text-[13px] text-[#52626e] md:block">
          <Link href="/" className="hover:text-ink">
            خانه
          </Link>{' '}
          / نوشته
        </p>
        <h1 className="mb-3 text-[27px] leading-[1.65] font-bold md:mt-3 md:mb-4 md:text-[40px] md:leading-[1.6]">
          {post.data.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted md:gap-2.5 md:text-sm">
          <time dateTime={date.toISOString()}>{formatDate(date, true)}</time>
          <Dot />
          <span>{faNum(readingMinutes(post))} دقیقه مطالعه</span>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-chip px-2.5 py-0.5 text-chip-ink hover:bg-chip-soft md:px-3"
            >
              #{t}
            </Link>
          ))}
        </div>

        <aside className="my-5 flex items-start gap-3.5 rounded-[18px] bg-channel p-3.5 md:my-8 md:rounded-[20px] md:p-[18px]">
          <span className="hidden size-10 flex-none items-center justify-center rounded-full bg-accent text-white md:flex">
            <TelegramIcon size={19} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold text-chip-ink">
              <TelegramIcon size={15} className="md:hidden" />
              منتشرشده در کانال <Dot /> {formatDate(date)}، {formatTime(date)}
            </span>
            {replyTo && (
              <Link
                href={replyTo.url}
                className="bubble self-start bg-surface px-3 py-2.5 text-sm text-ink-soft hover:bg-card md:px-3.5 md:text-[15px]"
              >
                <span className="block text-xs text-muted">در پاسخ به</span>
                <span className="line-clamp-2">{replyTo.data.title}</span>
              </Link>
            )}
            {post.data.media === 'video' && (
              <p className="bubble self-start bg-surface px-3 py-2.5 text-sm text-ink-soft md:px-3.5">
                این پیام یک ویدیو دارد که فقط در تلگرام قابل دیدن است.
              </p>
            )}
            <a href={telegram.url} target="_blank" rel="noopener" className="py-1 text-[13px] font-semibold text-accent hover:text-accent-strong">
              دیدن پیام در تلگرام ←
            </a>
          </div>
        </aside>

        <PostToc toc={toc} variant="details" />

        <div className="post-body">
          <MDX components={getMDXComponents({ a: createRelativeLink(blog, post) })} />
        </div>

        <nav aria-label="نوشته‌های دیگر" className="mt-8 grid gap-2.5 md:mt-10 md:grid-cols-2 md:gap-4">
          {older && (
            <Link href={older.url} className="block rounded-[14px] border border-line bg-card px-4 py-3.5 hover:border-line-strong md:rounded-2xl md:px-5 md:py-[18px]">
              <span className="block text-xs text-subtle">→ نوشتهٔ قبلی</span>
              <span className="line-clamp-2 text-[15px] font-semibold md:text-base">{older.data.title}</span>
            </Link>
          )}
          {newer && (
            <Link
              href={newer.url}
              className="block rounded-[14px] border border-line bg-card px-4 py-3.5 text-left hover:border-line-strong md:col-start-2 md:rounded-2xl md:px-5 md:py-[18px]"
            >
              <span className="block text-xs text-subtle">نوشتهٔ بعدی ←</span>
              <span className="line-clamp-2 text-[15px] font-semibold md:text-base" dir="rtl">
                {newer.data.title}
              </span>
            </Link>
          )}
        </nav>
      </article>

      <aside className="flex flex-col gap-[22px] text-sm lg:sticky lg:top-24">
        <div className="hidden lg:block">
          <PostToc toc={toc} variant="card" />
        </div>
        {rel.length > 0 && (
          <section className="lg:rounded-[20px] lg:border lg:border-line lg:bg-card lg:p-5">
            <h2 className="mb-2.5 text-base font-bold lg:mb-3 lg:text-sm">نوشته‌های مرتبط</h2>
            <div className="flex flex-col gap-2.5 lg:gap-3">
              {rel.map((p) => (
                <div key={p.url} className="rounded-[14px] border border-line bg-card px-4 py-3.5 text-[15px] lg:border-0 lg:p-0 lg:text-sm">
                  <RelatedLink post={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

export function generateStaticParams() {
  return blog.getPages().map((p) => ({ slug: p.slugs[0] }));
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = blog.getPage([slug]);
  if (!post) notFound();
  return {
    title: post.data.title,
    description: post.data.description,
    openGraph: { type: 'article', publishedTime: post.data.date.toISOString(), tags: post.data.tags },
  };
}
