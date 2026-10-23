#!/usr/bin/env python3
"""Import own posts from a Telegram Desktop HTML export into content/blog/.

Usage: python3 scripts/import-telegram.py "<path>/ChatExport_YYYY-MM-DD"

Rules (see AGENTS.md): message text is copied VERBATIM. The script only
escapes Markdown syntax so text renders exactly as written, turns <br> into
line breaks and links/hashtags into Markdown links. Forwarded messages, polls
and media-only messages are skipped. Extra topic tags live in
content/blog-tags.json and are merged in; never edit generated .md files.
"""
import html
import json
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path

CHANNEL_URL = 'https://t.me/said_to_who_reads'
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'content' / 'blog'
PHOTOS = OUT / 'photos'  # imported by the MDX image plugin (hashed, basePath-safe)
EXTRA_TAGS = ROOT / 'content' / 'blog-tags.json'
TITLE_MAX = 100  # a first line longer than this is a paragraph, not a title

ESCAPE = re.compile(r'([\\`*_\[\]<>#~|&])')
URL_LINE = re.compile(r'^<https?://[^>]+>$')
BLOCK_START = re.compile(r'^(\s*)([-+=]|\d+[.)])')


def esc(text: str) -> str:
    return ESCAPE.sub(r'\\\1', text)


def tag_name(hashtag: str) -> str:
    return hashtag.replace('_', ' ').strip()


class TextToMd(HTMLParser):
    """Telegram own-post text only contains <br> and <a>."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.hashtags: list[str] = []
        self.link: dict | None = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'br':
            self.out.append('\n')
        elif tag == 'a':
            self.link = {'href': a.get('href') or '', 'onclick': a.get('onclick') or '', 'text': ''}
        else:
            raise ValueError(f'unsupported tag <{tag}> — extend TextToMd')

    def handle_endtag(self, tag):
        if tag != 'a' or self.link is None:
            return
        link, self.link = self.link, None
        text = link['text']
        m = re.search(r'ShowHashtag\("(.+?)"\)', link['onclick'])
        if m:
            self.hashtags.append(m.group(1))
            self.out.append(f'[{esc(text)}](</?tag={tag_name(m.group(1))}>)')
        elif link['href'] and link['href'] == text:
            self.out.append(f'<{link["href"]}>')
        elif link['href']:
            self.out.append(f'[{esc(text)}](<{link["href"]}>)')
        else:
            self.out.append(esc(text))

    def handle_data(self, data):
        if self.link is not None:
            self.link['text'] += data
        else:
            self.out.append(esc(data))


def lines_to_md(lines: list[str]) -> str:
    """Blank line = paragraph; single line break = Markdown hard break."""
    paras, cur = [], []
    for line in lines:
        line = line.strip()
        if not line:
            if cur:
                paras.append(cur)
                cur = []
            continue
        cur.append(BLOCK_START.sub(r'\1\\\2', line))
    if cur:
        paras.append(cur)
    return '\n\n'.join('\\\n'.join(p) for p in paras)


def plain(md_lines: list[str]) -> str:
    text = ' '.join(l.strip() for l in md_lines if l.strip())
    text = re.sub(r'(?<!\\)\[(.*?)(?<!\\)\]\(<[^>]*>\)', r'\1', text)
    text = re.sub(r'<(https?://[^>]+)>', r'\1', text)
    return re.sub(r'\\(.)', r'\1', text)


def squash(text: str) -> str:
    return ' '.join(text.split())


def clip(text: str, n: int) -> str:
    if len(text) <= n:
        return text
    cut = text[:n].rsplit(' ', 1)[0]
    return cut.rstrip('،,:؛ ') + '…'


def parse(export: Path):
    src = (export / 'messages.html').read_text(encoding='utf-8')
    for chunk in re.split(r'(?=<div class="message )', src):
        if not chunk.startswith('<div class="message default'):
            continue
        if 'forwarded body' in chunk:
            continue
        m_text = re.search(r'<div class="text">\s*(.*?)\s*</div>', chunk, re.S)
        if not m_text:
            continue  # polls, photo-only
        mid = int(re.search(r'id="message(\d+)"', chunk).group(1))
        d = re.search(r'title="(\d\d)\.(\d\d)\.(\d{4}) (\d\d:\d\d:\d\d) UTC([+-]\d\d:\d\d)"', chunk)
        date = f'{d[3]}-{d[2]}-{d[1]}T{d[4]}{d[5]}'
        reply = re.search(r'GoToMessage\((\d+)\)', chunk)
        photos = re.findall(r'<a class="photo_wrap[^"]*" href="(photos/[^"]+)"', chunk)
        conv = TextToMd()
        conv.feed(m_text.group(1).replace('\n', ''))
        conv.close()
        md_lines = ''.join(conv.out).split('\n')
        # Verbatim guard: rendered text must equal the original message text.
        original = html.unescape(re.sub(r'<[^>]+>', '', m_text.group(1).replace('\n', '').replace('<br>', '\n')))
        assert squash(plain(md_lines)) == squash(original), f'message {mid}: text changed during conversion'
        yield {
            'id': mid,
            'date': date,
            'reply_to': int(reply.group(1)) if reply else None,
            'photos': photos,
            'video': 'media_video' in chunk,
            'lines': md_lines,
            'hashtags': conv.hashtags,
        }


def yaml_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)  # JSON strings are valid YAML


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    export = Path(sys.argv[1])
    extra = json.loads(EXTRA_TAGS.read_text()) if EXTRA_TAGS.exists() else {}

    OUT.mkdir(parents=True, exist_ok=True)
    PHOTOS.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob('*.md'):
        if 'telegram:' in old.read_text(encoding='utf-8'):
            old.unlink()

    posts = list(parse(export))
    ids = {p['id'] for p in posts}
    for p in posts:
        lines = p['lines']
        while lines and not lines[0].strip():
            lines.pop(0)
        # Title = first line that is not a bare link (usually the author's title).
        i = next((i for i, l in enumerate(lines) if l.strip() and not URL_LINE.match(l.strip())), 0)
        first = plain(lines[i:i + 1]).strip()
        rest = lines[:i] + lines[i + 1:]
        if len(first) <= TITLE_MAX and any(l.strip() for l in rest):
            title, body_lines = first, rest
        else:
            title, body_lines = clip(first, 70), lines

        tags = list(dict.fromkeys([tag_name(h) for h in p['hashtags']] + extra.get(str(p['id']), [])))

        fm = [
            '---',
            f'title: {yaml_str(title)}',
            f'description: {yaml_str(clip(plain(body_lines), 180))}',
            f'date: {yaml_str(p["date"])}',
            f'tags: {json.dumps(tags, ensure_ascii=False)}',
            'telegram:',
            f'  id: {p["id"]}',
            f'  url: {CHANNEL_URL}/{p["id"]}',
        ]
        if p['reply_to'] and p['reply_to'] in ids:
            fm.append(f'replyTo: {p["reply_to"]}')
        if p['video']:
            fm.append('media: video')
        fm.append('---')

        body = []
        for rel in p['photos']:
            name = Path(rel).name
            shutil.copy2(export / rel, PHOTOS / name)
            body.append(f'![تصویر پست](./photos/{name})')
        body.append(lines_to_md(body_lines))

        (OUT / f'{p["id"]}.md').write_text('\n'.join(fm) + '\n\n' + '\n\n'.join(b for b in body if b) + '\n', encoding='utf-8')

    print(f'imported {len(posts)} posts → {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
