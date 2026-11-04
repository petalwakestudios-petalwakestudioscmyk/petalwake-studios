# Petalwake Studios feature setup

This guide covers the contact form, its Cloudflare services, browser storage, and appearance preferences. Do not deploy until the provider configuration below is complete.

## Contact email routing

The Worker sends email through Resend. Topic values are stable identifiers shared by the English and Japanese forms; translated labels are presentation only.

| Topic | Destination |
| --- | --- |
| `general` | `hello@petalwakestudios.com` |
| `ministry` | `ministry@petalwakestudios.com` |
| `japan` | `japan@petalwakestudios.com` |
| `media` | `media@petalwakestudios.com` |
| `collaboration` | `contact@petalwakestudios.com` |
| `other` | `contact@petalwakestudios.com` |

The centralized server configuration also defines `info@petalwakestudios.com` for appropriate administrative notifications. It is not currently a contact-form destination. Visitors cannot choose a recipient.

### Resend setup

1. Add and verify `petalwakestudios.com` in Resend, including the DNS records Resend provides.
2. Confirm that Resend authorizes the sender address `noreply@petalwakestudios.com`.
3. Create a Resend API key with the minimum permissions required to send mail.
4. Configure the key as the encrypted Worker secret `RESEND_API_KEY`.
5. The Worker variable `RESEND_FROM_EMAIL` is set in `wrangler.json` to `noreply@petalwakestudios.com`. Change it there only to another verified sender address.

Delivery, provider logs, and retention are subject to Resend's service and account settings. The site does not set a retention period for Resend.

## Cloudflare Turnstile

1. Create a Turnstile widget for `petalwakestudios.com`.
2. Add both `petalwakestudios.com` and `www.petalwakestudios.com` as allowed widget hostnames if the `www` host is served. Do not add localhost to the production widget.
3. Configure the public site key as the build-time variable `PUBLIC_TURNSTILE_SITE_KEY`. It is intentionally public and is included in the contact page.
4. Configure the corresponding private key as the encrypted Worker secret `TURNSTILE_SECRET_KEY`.
5. The form requests the `contact` action. The Worker verifies the token through Siteverify and requires a successful response with a matching request hostname and action. Production hostnames are restricted in server code to the apex and `www` host.

Tokens are single-use and expire; the Worker fails closed on invalid, expired/reused, unverifiable, or mismatched tokens. Local testing must use a development Turnstile key and set `ENVIRONMENT=development` with suitable development hostnames. Never permit localhost in the production Worker.

## Cloudflare Worker and rate limiting

`wrangler.json` binds a Cloudflare Workers Rate Limiting API namespace as `CONTACT_RATE_LIMITER`, currently configured for 5 requests per 60 seconds per `CF-Connecting-IP` key. The handler requires this binding and trusted client-IP header; if either is unavailable, the endpoint fails closed rather than bypassing the limit. It does not trust `X-Forwarded-For`.

The Cloudflare binding must be provisioned and active for the deployed Worker. Confirm that `namespace_id` (`2026110401`) is unique within the Cloudflare account before using it; change it to an unused numeric namespace ID if needed. The Rate Limiting API is approximate and counters are maintained per Cloudflare location, so this is not a globally strict quota or a global duplicate-submission database. The site does not store message content for limiting.

### Required configuration

| Name | Location | Purpose |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build environment | Public Turnstile widget key |
| `TURNSTILE_SECRET_KEY` | Encrypted Worker secret | Server-side Siteverify credential |
| `RESEND_API_KEY` | Encrypted Worker secret | Resend email delivery credential |
| `RESEND_FROM_EMAIL` | Worker variable | Verified sender address; currently in `wrangler.json` |
| `ENVIRONMENT` | Worker variable | Production hostname enforcement; set to `production` in `wrangler.json` |
| `CONTACT_RATE_LIMITER` | Cloudflare Worker binding | Cloudflare-native per-IP request limiting |

Set secrets through the Cloudflare dashboard or Wrangler's interactive secret prompt, for example `npx wrangler secret put TURNSTILE_SECRET_KEY` and `npx wrangler secret put RESEND_API_KEY`. Enter the values at the prompt; do not put secret values in source control, build variables, shell history, or this guide. Re-run the production checks after setting the public build key. Local secrets may be supplied through Wrangler's local secret mechanism; do not commit local secret files.

## Privacy, cookies, and third-party services

- The contact Worker validates and temporarily processes submitted fields in memory before forwarding the email. It does not write contact messages to a site database. Error logs do not include message bodies.
- Cloudflare provides the connecting IP used for Turnstile verification and the per-IP rate-limit key. Cloudflare may process operational/security data as part of hosting.
- Resend handles the outbound email and may retain it subject to its service and account settings. No retention period or deletion guarantee is claimed by the site.
- The site does not set first-party cookies and does not use `sessionStorage`.
- The site uses `localStorage` keys `petalwake-language` and `petalwake-appearance` for language and theme preferences.
- Turnstile loads on the contact page and may process browser/device information or storage under Cloudflare's own practices.
- The film player is click-to-load and uses YouTube's `youtube-nocookie.com` embed. YouTube processes information after the embed is activated or an external YouTube link is followed.
- No analytics or advertising tracking is present, so the site does not add a consent banner for optional tracking. Third-party providers remain subject to their own policies.

## Appearance and localization

The navigation includes an accessible System / Light / Dark selector in English and Japanese, including mobile navigation. System is the default and follows `prefers-color-scheme`; explicit Light or Dark choices are saved in `petalwake-appearance`. A small inline head script reads the preference and applies the theme before page rendering to avoid a flash of the wrong theme. The Turnstile widget is rendered with the active light/dark theme.

## Testing

Run:

```sh
npm test
npm run check:production
```

The Node test suite exercises routing, stable English/Japanese topic identifiers, malformed and oversized requests, required fields, rate limiting, Turnstile success/failure/hostname/action checks, and Resend request routing. `check:production` builds the site, type-checks it, runs Wrangler's deployment dry run, and checks generated SEO output.

These are automated unit/build checks, not live provider tests. A successful test does not verify Resend domain authorization, Cloudflare secrets/bindings, real Turnstile widget behavior, delivery to each inbox, or visual theme behavior in every browser. Before release, manually verify both contact routes in a browser with test credentials, retry after CAPTCHA failure, the desktop/mobile appearance selector, and representative page surfaces in system/light/dark modes. Do not deploy as part of these checks.
