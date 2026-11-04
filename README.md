# Petalwake Studios

Petalwake Studios is a multidisciplinary creative studio exploring storytelling through film, animation, music, illustration, and experimental image-making. Stories that awaken wonder.

## Studio content

- Update verified film entries, story copy, and YouTube URLs in `src/data/films.ts`.
- Keep production stages in `productionSteps` and include only confirmed credits, release years, and project details.
- Add film thumbnails to `public/images/` and use their public paths in `FILMS`.
- The homepage uses the unbranded mountain-lake artwork and responsive WebP delivery variants in `public/images/petalwake-hero-*.webp`. Root-level concept boards and branded mockups are reference assets, not production backgrounds.
- The original film thumbnail is retained as `the-last-winter-thumbnail-source.jpg`; the site serves responsive WebP derivatives.
- The Cloudflare Worker deployment is configured in `wrangler.json` and `astro.config.mjs`.

## Site routes

- `/` — Studio homepage.
- `/work/` — Published films and creative work.
- `/work/the-last-winter/` — Film page, synopsis, and production note.
- `/about/` — Studio approach, values, and inspiration.
- `/contact/` — Secure contact form with server-side validation, Turnstile verification, and routed email delivery.
- `/films/the-last-winter/` — Permanent redirect to the current film page.

The Journal is intentionally not published until genuine editorial content is ready.
The film page uses a verified YouTube link and a click-to-load player. Video structured data is not included because verified publication metadata is not available in the repository.

Contact messages are validated by a Cloudflare Worker, checked with Turnstile, and delivered through Resend to a server-selected studio inbox. Message contents are not stored in a site database. See [PETALWAKE_FEATURE_SETUP.md](./PETALWAKE_FEATURE_SETUP.md) for provider setup, required Worker secrets, rate-limit behavior, privacy/storage details, and test instructions. The site offers system, light, and dark appearance modes; explicit appearance and language preferences are stored in localStorage. Confirm the alternate `www` host redirects correctly in Cloudflare; the repository uses the non-`www` canonical host.

## Search and domain setup

- The canonical production host is `https://petalwakestudios.com` and the sitemap is published at `/sitemap-index.xml`.
- If `www.petalwakestudios.com` is enabled in Cloudflare, configure a redirect from `https://www.petalwakestudios.com/*` to `https://petalwakestudios.com/$1`; do not serve duplicate site content on both hosts.
- After deployment, add a Google Search Console Domain property, verify it with a Cloudflare DNS TXT record, submit `https://petalwakestudios.com/sitemap-index.xml`, and inspect the homepage and Core Web Vitals.
- For Google HTML-tag verification, add the token Google supplies as a `google-site-verification` meta tag in `src/components/BaseHead.astro`. Do not add a placeholder token.
- For Bing Webmaster Tools, add its verification token in the same head component only after Bing supplies it. Do not add a placeholder token.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local Astro server |
| `npm run build` | Create the production build |
| `npm run check` | Build, typecheck, and dry-run Wrangler deploy |
| `npm run check:seo` | Validate generated HTML, sitemap, robots, metadata, and internal links |
| `npm run check:production` | Run project checks and SEO validation |
| `npm test` | Run the functional contact API and routing tests |
| `npm run deploy` | Deploy to Cloudflare |
