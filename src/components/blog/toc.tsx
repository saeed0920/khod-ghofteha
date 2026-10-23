'use client';
import { AnchorProvider, TOCItem, type TOCItemType } from 'fumadocs-core/toc';

/** Desktop: sticky card with active-section marker. Mobile: collapsible <details>. */
export function PostToc({ toc, variant }: { toc: TOCItemType[]; variant: 'card' | 'details' }) {
  const items = toc.filter((t) => t.depth <= 3);
  if (items.length === 0) return null;

  const list = (
    <AnchorProvider toc={items} single>
      {items.map((t) => (
        <TOCItem
          key={t.url}
          href={t.url}
          style={{ paddingInlineStart: (t.depth - 2) * 12 + (variant === 'card' ? 14 : 0) }}
          className={
            variant === 'card'
              ? '-me-0.5 border-e-2 border-transparent py-1.5 text-muted hover:text-ink data-[active=true]:border-accent data-[active=true]:font-semibold data-[active=true]:text-accent-strong'
              : 'py-2 text-muted data-[active=true]:text-accent-strong'
          }
        >
          {t.title}
        </TOCItem>
      ))}
    </AnchorProvider>
  );

  if (variant === 'details')
    return (
      <details className="mb-5 rounded-2xl border border-line bg-card px-4 lg:hidden">
        <summary className="flex min-h-12 cursor-pointer items-center text-[15px] font-semibold">در این نوشته</summary>
        <div className="flex flex-col pb-3 text-sm">{list}</div>
      </details>
    );

  return (
    <nav aria-label="در این نوشته" className="rounded-[20px] border border-line bg-card p-5">
      <h2 className="mb-2.5 text-sm font-bold">در این نوشته</h2>
      <div className="flex flex-col border-e-2 border-line">{list}</div>
    </nav>
  );
}
