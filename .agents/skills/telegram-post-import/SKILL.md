---
name: telegram-post-import
description: Import or refresh khod-ghofteha blog posts from a Telegram Desktop channel export, tag them, verify verbatim text, build and deploy to GitHub Pages. Use when the user gives a new ChatExport folder, asks to add/update posts or tags, or asks how to build/deploy this blog.
---

# Telegram → blog posts

Read `AGENTS.md` first. The one rule that matters: **message text is never edited**.
You only (re)generate files, add tags, and change layout.

## 1. Get the export

User exports the channel from Telegram Desktop: channel → ⋮ → Export chat history,
format **HTML**, include **Photos** (videos optional, they are not imported).
Result: a folder like `~/Downloads/Telegram Desktop/ChatExport_YYYY-MM-DD/` with `messages.html` and `photos/`.
Always import the **full** history export (the importer rewrites all generated posts).

## 2. Import

```bash
bun run import:telegram "<export dir>"
```

- Writes `content/blog/<message id>.md` + `content/blog/photos/*` (copies only own posts' photos).
- Deletes previously generated posts first (files containing `telegram:` frontmatter).
- Skips forwarded messages, polls, media-only messages.
- Aborts with `message N: text changed during conversion` if escaping would alter text —
  fix the converter (`TextToMd` / `esc`) in `scripts/import-telegram.py`, never the post.
- `unsupported tag <x>` → Telegram used new formatting (bold, quote…); extend `TextToMd`
  to map it to Markdown, then re-run.

Frontmatter produced (don't hand-edit):

```yaml
title: "first line"            # see title rule in AGENTS.md
description: "first ~180 chars of body…"
date: "2024-11-05T09:34:01+03:30"
tags: ["خود گفته"]             # #hashtags (underscores → spaces) + content/blog-tags.json
telegram: { id: 327, url: https://t.me/said_to_who_reads/327 }
replyTo: 109                   # optional, if replying to another imported post
media: video                   # optional, video not in export → page links to Telegram
```

## 3. Tag new untagged posts

```bash
grep -l '^tags: \[\]' content/blog/*.md
```

For each: read the post, add 1–3 tags to `content/blog-tags.json` under its id,
**reusing existing tag names** (e.g. اقتصاد سیاسی، فلسفه، فلسفه سیاسی، منطق ریاضی،
نظریه محاسبه، تاریخ، اقتصاد، سیاست، نظرات شخصی، پیشنهاد، معرفی کتاب، اطلاع‌رسانی).
Only invent a new tag if none fit. Re-run step 2.

## 4. Verify

```bash
bun run types:check
bun run build
bun run check:posts "<export dir>"     # must print N/N posts verbatim
```

Optional visual check: Pages preview from `AGENTS.md`, screenshot `/`, `/blog/<id>/`,
`/blog/` at 1280, 820 and 390 widths (`chromium --headless=new --screenshot=… --window-size=W,H URL`).

## 5. Deploy

Commit (`content/blog`, `content/blog-tags.json`, code) and push to `main`.
GitHub Actions `Deploy to GitHub Pages` publishes https://saeed0920.github.io/khod-ghofteha/ .
Check: `gh run list --workflow deploy.yml -L 1` / `gh run watch`.
Don't push without the user's go-ahead.
