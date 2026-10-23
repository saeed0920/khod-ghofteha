import type { Metadata } from 'next';
import Link from 'next/link';
import { faNum, formatDate, getPosts, type Post } from '@/lib/blog';

export const metadata: Metadata = { title: 'بایگانی' };

const monthYear = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long', year: 'numeric', timeZone: 'Asia/Tehran' });

export default function ArchivePage() {
  const posts = getPosts();
  const groups = new Map<string, Post[]>();
  for (const p of posts) {
    const key = monthYear.format(p.data.date);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  return (
    <main className="mx-auto max-w-[860px] px-4 pt-7 pb-4 md:px-6 md:pt-12 md:pb-20">
      <h1 className="text-[26px] leading-[1.6] font-bold md:text-4xl">بایگانی</h1>
      <p className="mb-6 text-[15px] text-[#52626e] md:mb-10 md:text-[17px]">{faNum(posts.length)} نوشته، از جدید به قدیم.</p>
      <div className="flex flex-col gap-5 md:gap-7">
        {[...groups].map(([month, items]) => (
          <section key={month} className="rounded-[18px] border border-line bg-card p-[18px] md:rounded-[20px] md:p-6">
            <h2 className="mb-2 flex items-baseline gap-2 text-[17px] font-bold md:text-lg">
              {month}
              <span className="text-sm font-normal text-subtle">{faNum(items.length)} نوشته</span>
            </h2>
            <ul className="divide-y divide-line">
              {items.map((p) => (
                <li key={p.url}>
                  <Link href={p.url} className="flex items-baseline gap-3 py-2.5 hover:text-accent-strong">
                    <span className="w-14 flex-none text-[13px] text-subtle">{formatDate(p.data.date).split(' ')[0]}</span>
                    <span className="line-clamp-2 flex-1 text-[15px] leading-[1.8] md:text-base">{p.data.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
