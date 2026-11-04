import type { APIRoute } from 'astro';
import { handleContactPost } from '../../server/contact-handler.ts';

export const prerender = false;

export function createContactPost(fetcher: typeof fetch = fetch): APIRoute {
	return async ({ request, locals }) => {
		const runtimeEnv = locals.runtime?.env;
		return handleContactPost(request, runtimeEnv ?? {}, fetcher);
	};
}

export const POST = createContactPost();
