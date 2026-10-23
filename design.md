# Design — Mist Blue (RTL, light only)

Source mock: `design/RTL Blog — Mist Blue.html` (home + post, desktop 1280 + mobile 390).
Dark-theme board in that file is intentionally **not** implemented.

- **Audience:** Persian readers of a political-economy / philosophy / logic channel. Long reading.
- **Type:** IBM Plex Sans Arabic 400–700. Body line-height 1.9; post body 17px (mobile) / 19px (≥1024px), line-height 2.15.
- **Tokens** (`src/app/global.css @theme`): page `#EDF1F3`, surface `#F7F9FA`, card `#FFF`, line `#E1E7EA`,
  ink `#1E2A33`, muted `#4C5D69`, subtle `#5B6B77`, accent `#2F5F7E` / hover `#1E445E`,
  chip `#DFE8ED` / `#E8EFF3` / ink `#2B4A5E`, channel panel `#DCE6EC`.
- **Shapes:** cards radius 18–20px, chips full pill, Telegram bubble `16 16 4 16` (tail on start side).
- **Inputs:** no borders — white fill + soft shadow, focus ring `accent/30`.
- **Breakpoints:** mobile <768 (single column, horizontal chip scroll, hamburger `<details>` menu),
  tablet 768–1023 (single column, sidebar cards in 2 columns), desktop ≥1024 (main + 300px sidebar; post TOC/related sticky).
- **A11y:** 44px+ touch targets, visible focus outline, `aria-pressed` chips, `aria-current` nav, reduced-motion respected.
- **Separators:** never `·` beside Persian digits; use `<Dot />`.
