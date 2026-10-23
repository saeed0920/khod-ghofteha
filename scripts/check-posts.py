#!/usr/bin/env python3
"""Verify every built post renders the Telegram text verbatim.

Usage: bun run build && python3 scripts/check-posts.py "<path>/ChatExport_YYYY-MM-DD"
Compares (whitespace-insensitive) original message text with h1 + .post-body
text in .next/server/app/blog/<id>.html.
"""
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOID = {'br', 'img', 'hr', 'input', 'source', 'meta', 'link'}


class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth, self.in_h1, self.body, self.title = 0, False, [], []

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        if self.depth:
            self.depth += 1
        elif tag == 'div' and dict(attrs).get('class') == 'post-body':
            self.depth = 1
        self.in_h1 = self.in_h1 or tag == 'h1'

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.depth:
            self.depth -= 1
        if tag == 'h1':
            self.in_h1 = False

    def handle_data(self, data):
        if self.depth:
            self.body.append(data)
        if self.in_h1:
            self.title.append(data)


def nows(s: str) -> str:
    return re.sub(r'\s', '', s)


def main():
    src = (Path(sys.argv[1]) / 'messages.html').read_text(encoding='utf-8')
    bad = total = 0
    for chunk in re.split(r'(?=<div class="message )', src):
        if not chunk.startswith('<div class="message default') or 'forwarded body' in chunk:
            continue
        m = re.search(r'<div class="text">\s*(.*?)\s*</div>', chunk, re.S)
        if not m:
            continue
        mid = re.search(r'id="message(\d+)"', chunk).group(1)
        original = nows(html.unescape(re.sub(r'<[^>]+>', '', m.group(1))))
        page = ROOT / '.next' / 'server' / 'app' / 'blog' / f'{mid}.html'
        p = Extract()
        p.feed(page.read_text(encoding='utf-8'))
        body, title = nows(''.join(p.body)), nows(''.join(p.title))
        total += 1
        if original not in (body, title + body):
            bad += 1
            print(f'MISMATCH /blog/{mid}')
    print(f'{total - bad}/{total} posts verbatim')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
