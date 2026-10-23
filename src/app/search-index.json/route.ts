import { blog } from '@/lib/blog';

export const dynamic = 'force-static';

/** Full post text for client-side search: { [url]: text }. Fetched lazily on first query. */
export function GET() {
  const index: Record<string, string> = {};
  for (const p of blog.getPages()) {
    const { headings, contents } = p.data.structuredData;
    index[p.url] = [...headings, ...contents].map((c) => c.content).join(' ');
  }
  return Response.json(index);
}
