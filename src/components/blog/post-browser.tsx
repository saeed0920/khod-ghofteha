'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { PostSummary } from '@/lib/blog';
import { appDescription, appName } from '@/lib/shared';
import { PostCard } from './post-card';

const PAGE = 12;

// Persian search: unify Arabic ی/ک, drop ZWNJ, ignore case.
const normalize = (s: string) =>
  s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').toLowerCase();

const fa = new Intl.NumberFormat('fa-IR');

let indexPromise: Promise<Record<string, string>> | undefined;
const loadIndex = () =>
  (indexPromise ??= fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/search-index.json`)
    .then((r) => r.json())
    .catch(() => {
      indexPromise = undefined; // retry on next query
      return {};
    }));

/** ~140 chars around the first hit, or undefined. */
function snippet(text: string, needle: string) {
  const at = normalize(text).indexOf(needle);
  if (at < 0) return undefined;
  const start = Math.max(0, at - 60);
  return (start > 0 ? '…' : '') + text.slice(start, at + needle.length + 80).trim() + '…';
}

export function PostBrowser({
  posts,
  tags,
  sidebar,
}: {
  posts: PostSummary[];
  tags: { name: string; count: number }[];
  sidebar: ReactNode;
}) {
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [index, setIndex] = useState<Record<string, string>>();
  const input = useRef<HTMLInputElement>(null);

  // URL → state on load (?tag=, ?q=, #search).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setTag(params.get('tag'));
    setQ(params.get('q') ?? '');
    if (location.hash === '#search') input.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // State → URL (written from handlers, not an effect, so Strict Mode's
  // double-run can't wipe ?tag= before it's read). Filtered views stay shareable.
  const update = (nextTag: string | null, nextQ: string) => {
    setTag(nextTag);
    setQ(nextQ);
    setLimit(PAGE);
    const params = new URLSearchParams();
    if (nextTag) params.set('tag', nextTag);
    if (nextQ.trim()) params.set('q', nextQ.trim());
    const qs = params.toString();
    history.replaceState(history.state, '', qs ? `?${qs}` : location.pathname);
  };

  // Full-text index loads on first query only.
  useEffect(() => {
    if (q.trim() && !index) loadIndex().then(setIndex);
  }, [q, index]);

  const filtered = useMemo(() => {
    const needle = normalize(q.trim());
    return posts.flatMap((p) => {
      if (tag && !p.tags.includes(tag)) return [];
      if (!needle) return [p];
      if (normalize([p.title, p.description, ...p.tags].join(' ')).includes(needle)) return [p];
      const hit = index?.[p.url] && snippet(index[p.url], needle);
      return hit ? [{ ...p, description: hit }] : [];
    });
  }, [posts, tag, q, index]);

  const toggle = (name: string | null) => update(tag === name ? null : name, q);
  const pickTag = (name: string) => {
    update(name, q);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chips = [{ name: null, label: 'همه' }, ...tags.slice(0, 10).map((t) => ({ name: t.name, label: `#${t.name}` }))];

  return (
    <>
      <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-2.5 px-4 pt-7 pb-5 text-center md:gap-3.5 md:px-6 md:pt-12 md:pb-8">
        <h1 className="text-[26px] leading-[1.6] font-bold md:text-4xl">{appName}</h1>
        <p className="max-w-[560px] text-[15px] text-[#52626e] md:text-[17px]">
          {appDescription}.<span className="hidden md:inline"> جستجو کن یا از برچسب‌ها شروع کن.</span>
        </p>
        <div className="mt-1.5 w-full max-w-[620px] md:mt-2.5">
          <label htmlFor="search" className="sr-only">
            جستجو در نوشته‌ها
          </label>
          <div className="flex items-center gap-2.5 rounded-[14px] bg-card px-3.5 shadow-[0_6px_20px_rgba(30,42,51,0.06)] focus-within:ring-2 focus-within:ring-accent/30 md:px-4">
            <Search size={20} className="flex-none text-subtle" aria-hidden />
            <input
              ref={input}
              id="search"
              type="search"
              value={q}
              onChange={(e) => update(tag, e.target.value)}
              placeholder="جستجو در نوشته‌ها…"
              className="min-h-[50px] min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-subtle md:min-h-[54px]"
            />
            <kbd dir="ltr" className="hidden rounded-md bg-chip-soft px-1.5 text-xs text-subtle md:inline">
              ⌘K
            </kbd>
          </div>
        </div>
      </section>

      <div
        role="group"
        aria-label="برچسب‌ها"
        className="mx-auto -mt-1 flex max-w-[1200px] gap-2 overflow-x-auto px-4 pb-4 text-[13px] whitespace-nowrap md:-mt-4 md:flex-wrap md:justify-center md:px-6 md:pb-8"
      >
        {chips.map((c) => {
          const on = tag === c.name;
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.name)}
              className="min-h-9 flex-none cursor-pointer rounded-full border border-transparent bg-chip px-3.5 text-chip-ink hover:border-accent/40 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white"
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 pb-4 md:px-6 md:pb-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-9">
        <main className="flex min-w-0 flex-col gap-3.5 md:gap-5">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-[17px] font-bold md:text-xl">
              {tag ? `#${tag}` : q.trim() ? 'نتیجهٔ جستجو' : 'تازه‌ترین نوشته‌ها'}
            </h2>
            <span className="text-sm text-subtle" aria-live="polite">
              {fa.format(filtered.length)} نوشته
            </span>
          </div>

          {filtered.slice(0, limit).map((p) => (
            <PostCard key={p.url} post={p} onTag={pickTag} />
          ))}

          {filtered.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="min-h-12 cursor-pointer rounded-[14px] border border-line-strong bg-card text-[15px] font-semibold text-accent hover:border-accent"
            >
              نوشته‌های بیشتر
              <span className="ms-1.5 text-sm font-normal text-subtle">({fa.format(filtered.length - limit)})</span>
            </button>
          )}

          {filtered.length === 0 && (
            <div className="rounded-[18px] border border-dashed border-[#c9d4da] bg-card p-10 text-center text-muted">
              <p className="mb-3">نوشته‌ای پیدا نشد.</p>
              <button
                type="button"
                onClick={() => {
                  update(null, '');
                }}
                className="min-h-11 cursor-pointer rounded-full border border-[#c9d4da] bg-surface px-[18px] text-sm text-accent hover:border-accent"
              >
                پاک کردن فیلترها
              </button>
            </div>
          )}
        </main>

        <aside className="grid gap-5 md:grid-cols-2 lg:grid-cols-1 lg:gap-[22px]">
          {sidebar}
          <section className="hidden rounded-[20px] border border-line bg-card p-5 md:block">
            <h2 className="mb-3 text-[15px] font-bold">برچسب‌ها</h2>
            <div className="flex flex-wrap gap-2 text-[13px]">
              {tags.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  aria-pressed={tag === t.name}
                  onClick={() => pickTag(t.name)}
                  className="cursor-pointer rounded-[10px] border border-line-strong bg-surface px-3 py-1.5 text-chip-ink hover:border-accent aria-pressed:border-accent aria-pressed:bg-chip-soft"
                >
                  #{t.name} <span className="text-subtle">{fa.format(t.count)}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
