import { loader } from 'fumadocs-core/source';
import { defineCollections } from 'fumadocs-mdx/macro';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const posts = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: pageSchema.extend({
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // Source message in the Telegram channel (posts are imported verbatim, see AGENTS.md).
    telegram: z.object({ id: z.number(), url: z.string().url() }),
    replyTo: z.number().optional(),
    media: z.enum(['video']).optional(),
  }),
});

export const blog = loader({
  baseUrl: '/blog',
  source: posts.toFumadocsSource(),
});

export type Post = NonNullable<ReturnType<typeof blog.getPage>>;

export const getPostById = (id: number) => blog.getPage([String(id)]);

/** Newest first. */
export function getPosts(): Post[] {
  return blog.getPages().sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

const fa = new Intl.NumberFormat('fa-IR');
export const faNum = (n: number) => fa.format(n);

const dayMonth = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', timeZone: 'Asia/Tehran' });
const full = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });
const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tehran' });

export const formatDate = (d: Date, withYear = false) => (withYear ? full : dayMonth).format(d);
export const formatTime = (d: Date) => time.format(d);

/** ~200 Persian words per minute, minimum 1. */
export function readingMinutes(post: Post): number {
  const { contents, headings } = post.data.structuredData;
  const text = [...headings, ...contents].map((c) => c.content).join(' ');
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

/** Plain, serializable shape for client components. */
export function toSummary(post: Post) {
  return {
    url: post.url,
    title: post.data.title,
    description: post.data.description ?? '',
    tags: post.data.tags,
    date: formatDate(post.data.date, true),
    minutes: faNum(readingMinutes(post)),
    time: formatTime(post.data.date),
  };
}
export type PostSummary = ReturnType<typeof toSummary>;
