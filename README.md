# خودگفته‌ها

Blog for the Telegram channel [@said_to_who_reads](https://t.me/said_to_who_reads) —
every post is a channel message, imported verbatim.

Live: https://saeed0920.github.io/khod-ghofteha/

```bash
bun install
bun run dev
```

- Adding/refreshing posts: `.agents/skills/telegram-post-import/SKILL.md`
- Rules for contributors and agents: `AGENTS.md`
- Design: `design.md`

Deploys automatically to GitHub Pages on push to `main`, plus a weekly rebuild
(Saturday 03:17 UTC) that refreshes the «تازه در کانال» panel from
https://t.me/s/said_to_who_reads. Rebuild now: `gh workflow run deploy.yml`.

New channel posts become blog posts only through an export import
(see the skill above); the weekly rebuild doesn't create posts.
