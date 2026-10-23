import { channel } from './shared';

export interface ChannelMessage {
  id: number;
  text: string;
  date: Date;
  forwarded: boolean;
}

const decode = (s: string) =>
  s
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();

/** Parse Telegram's public channel preview page (https://t.me/s/<channel>). */
export function parseChannelPage(html: string): ChannelMessage[] {
  return html
    .split('class="tgme_widget_message_wrap')
    .slice(1)
    .flatMap((chunk) => {
      const id = chunk.match(/data-post="[^"/]+\/(\d+)"/)?.[1];
      const text = chunk.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
      const date = chunk.match(/<time datetime="([^"]+)"/)?.[1];
      if (!id || !text || !date) return [];
      return [{ id: Number(id), text: decode(text), date: new Date(date), forwarded: chunk.includes('tgme_widget_message_forwarded_from') }];
    })
    .reverse(); // newest first
}

/**
 * Latest channel messages, fetched at build time (no bot/token needed — public preview page).
 * Freshness = rebuild frequency (hourly cron in deploy.yml). Returns [] when t.me is unreachable
 * (e.g. local dev behind a filter); callers fall back to imported posts.
 */
export async function getLatestChannelMessages(limit = 3): Promise<ChannelMessage[]> {
  try {
    const res = await fetch(`https://t.me/s/${channel.handle}`, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return parseChannelPage(await res.text()).slice(0, limit);
  } catch {
    return [];
  }
}
