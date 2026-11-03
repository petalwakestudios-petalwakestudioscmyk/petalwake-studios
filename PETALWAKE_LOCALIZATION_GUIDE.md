# Petalwake Studios localization guide

## How localization works

The site keeps the existing English URLs as the default and serves Japanese equivalents below `/ja/`. The routes are static Astro pages, so both search engines and visitors receive real, language-specific HTML rather than a runtime translation overlay.

- Shared labels, navigation, and footer copy for both languages are in `src/i18n/common.ts`.
- Japanese page copy, metadata, form messages, and the localized `The Last Winter` content are in `src/i18n/ja.ts`.
- English page copy remains in the existing English route files under `src/pages/`; the film's English story and production data are in `src/data/films.ts`.
- `src/i18n/routing.ts` defines the supported routes and maps a page to its language counterpart. If there is no counterpart, the switcher falls back to that language's homepage.
- Shared header and footer components select their labels and internal links from the current URL. The language switcher stores an explicit choice in `localStorage` under `petalwake-language`; a saved Japanese choice is restored through the matching `/ja/` route. There is no IP-based language detection.
- `BaseHead.astro` emits each page's canonical URL and the English, Japanese, and `x-default` hreflang links for paired pages. The existing sitemap integration includes the generated localized routes.
- Unmatched `/ja/...` URLs use a Japanese-language 404 response; the switcher sends unmatched paths to the selected language's homepage.

## Add a page in both languages

1. Add the English page in `src/pages/` using the existing Astro page structure.
2. Add its Japanese counterpart under the matching `src/pages/ja/` path. Keep the same component structure and classes so the current design remains shared.
3. Store Japanese copy and metadata in `src/i18n/ja.ts`; use `language="ja"` on `BaseHead` and `lang="ja"` on the document. Keep English originals in the English route and set `lang="en"`.
4. Add the English path to the supported route set in `src/i18n/routing.ts`. Add both generated paths to `localizedRoutePairs` in `scripts/check-seo.mjs` so the checker verifies hreflang and sitemap coverage.
5. Use `localizedPath()` for internal links so a visitor remains in their selected language.

The Astro sitemap integration discovers prerendered routes automatically; do not add language-prefixed URLs by hand to a separate sitemap.

## Update project descriptions

- Update verified English film details, descriptions, credits, and production steps in `src/data/films.ts`.
- Update the matching Japanese title treatment, descriptions, themes, accessible image text, and production-step copy in the `film` section of `src/i18n/ja.ts`.
- Preserve original project names and verified facts. Keep the route slug and media identifiers consistent between locales.
- For a new project page, add paired routes and update the route and SEO maps described above.

## Japanese typography and review

Japanese pages use local system fallbacks for Noto Sans JP, Noto Serif JP, Hiragino, and Yu Gothic/Mincho. No external font service is required. Language-specific line height, letter spacing, and small-screen heading sizing are set in `src/styles/studio.css`.

The Japanese copy is an editorial localization draft. Before publication, have a fluent Japanese editor review the studio's tone and especially the Christian theological wording. The short Scripture renderings are original translations for this site, not quotations from a published Japanese Bible edition.
