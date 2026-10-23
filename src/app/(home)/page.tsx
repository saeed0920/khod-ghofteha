import { ChannelFeed } from '@/components/blog/channel-feed';
import { PostBrowser } from '@/components/blog/post-browser';
import { getPosts, toSummary } from '@/lib/blog';

export default function HomePage() {
  const posts = getPosts();
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const tags = [...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  return <PostBrowser posts={posts.map(toSummary)} tags={tags} sidebar={<ChannelFeed posts={posts} />} />;
}
