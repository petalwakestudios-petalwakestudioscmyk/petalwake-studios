type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface Env {
  CONTACT_RATE_LIMITER: RateLimit;
  ENVIRONMENT: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  TURNSTILE_ALLOWED_HOSTNAMES?: string;
}

declare namespace App {
  interface Locals extends Runtime {}
}
