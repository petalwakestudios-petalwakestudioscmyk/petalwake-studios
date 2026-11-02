# Petalwake Studios

Petalwake Studios is an independent animation studio creating cinematic stories and imagined worlds designed to awaken wonder.

## Studio content

- Update the verified film entry and YouTube URL in `src/consts.ts`.
- Add film thumbnails to `public/images/` and use their public paths in `FILMS`.
- The original homepage identity artwork is `public/images/petalwake-mountain-lake-hero.png`; the site serves its optimized WebP derivative.
- The Cloudflare Worker deployment is configured in `wrangler.json` and `astro.config.mjs`.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local Astro server |
| `npm run build` | Create the production build |
| `npm run check` | Build, typecheck, and dry-run Wrangler deploy |
| `npm run deploy` | Deploy to Cloudflare |
