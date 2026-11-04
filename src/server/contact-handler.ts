import type { ContactResponseCode, ContactTopic } from '../lib/contact-contract';
import { CONTACT_ROUTING, getContactDestination } from './contact-routing.ts';

const MAX_REQUEST_BYTES = 16_384;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 2_500;
const MAX_TOKEN_LENGTH = 2_048;
const SITEVERIFY_TIMEOUT_MS = 5_000;
const RESEND_TIMEOUT_MS = 10_000;
const EXPECTED_ACTION = 'contact';
const PRODUCTION_HOSTNAMES = new Set(['petalwakestudios.com', 'www.petalwakestudios.com']);
const ALLOWED_FIELDS = new Set([
	'name',
	'email',
	'topic',
	'message',
	'website',
	'cf-turnstile-response',
]);

export interface ContactEnvironment {
	CONTACT_RATE_LIMITER?: Pick<RateLimit, 'limit'>;
	ENVIRONMENT?: string;
	TURNSTILE_SECRET_KEY?: string;
	RESEND_API_KEY?: string;
	RESEND_FROM_EMAIL?: string;
	TURNSTILE_ALLOWED_HOSTNAMES?: string;
}

interface TurnstileResult {
	success?: boolean;
	hostname?: string;
	action?: string;
	'error-codes'?: string[];
}

function jsonResponse(status: number, code: ContactResponseCode) {
	return new Response(JSON.stringify({ code }), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

function isAllowedContentType(contentType: string | null) {
	return contentType?.toLowerCase().startsWith('multipart/form-data;') === true
		|| contentType?.toLowerCase() === 'application/x-www-form-urlencoded';
}

async function readBoundedBody(request: Request) {
	const reader = request.body?.getReader();
	if (!reader) return { bytes: new Uint8Array(), tooLarge: false };

	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_REQUEST_BYTES) {
				await reader.cancel();
				return { bytes: new Uint8Array(), tooLarge: true };
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}

	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return { bytes, tooLarge: false };
}

function getAllowedHostnames(env: ContactEnvironment) {
	if (env.ENVIRONMENT === 'production') return PRODUCTION_HOSTNAMES;
	const configured = env.TURNSTILE_ALLOWED_HOSTNAMES
		?.split(',')
		.map((hostname) => hostname.trim().toLowerCase())
		.filter(Boolean);
	return new Set(configured?.length ? configured : [
		...PRODUCTION_HOSTNAMES,
		'localhost',
		'127.0.0.1',
		'::1',
	]);
}

function readFormFields(formData: FormData) {
	const values = new Map<string, string>();
	for (const [key, value] of formData.entries()) {
		if (!ALLOWED_FIELDS.has(key) || values.has(key) || typeof value !== 'string') return undefined;
		values.set(key, value.trim());
	}
	return values;
}

async function verifyTurnstile(
	token: string,
	secret: string,
	clientIp: string,
	expectedHostname: string,
	fetcher: typeof fetch,
) {
	try {
		const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret, response: token, remoteip: clientIp }),
			signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
		});
		if (!response.ok) return { code: 'captcha_unavailable' as const };

		let result: TurnstileResult;
		try {
			result = await response.json() as TurnstileResult;
		} catch {
			return { code: 'captcha_unavailable' as const };
		}
		if (result.success !== true) return { code: 'captcha_invalid' as const };
		if (typeof result.hostname !== 'string' || result.hostname.toLowerCase() !== expectedHostname) {
			return { code: 'captcha_hostname_mismatch' as const };
		}
		if (result.action !== EXPECTED_ACTION) return { code: 'captcha_action_mismatch' as const };
		return { code: undefined };
	} catch {
		return { code: 'captcha_unavailable' as const };
	}
}

export async function handleContactPost(
	request: Request,
	env: ContactEnvironment,
	fetcher: typeof fetch = fetch,
) {
	if (!isAllowedContentType(request.headers.get('content-type'))) {
		return jsonResponse(415, 'invalid_content_type');
	}

	const contentLength = request.headers.get('content-length');
	if (contentLength !== null) {
		if (!/^\d+$/.test(contentLength)) return jsonResponse(400, 'invalid_content_length');
		if (Number(contentLength) > MAX_REQUEST_BYTES) return jsonResponse(413, 'request_too_large');
	}

	const requestHostname = new URL(request.url).hostname.toLowerCase();
	const allowedHostnames = getAllowedHostnames(env);
	if (!allowedHostnames.has(requestHostname)) {
		return jsonResponse(400, 'captcha_hostname_mismatch');
	}

	const clientIp = request.headers.get('cf-connecting-ip')?.trim();
	if (!clientIp || clientIp.length > 64) return jsonResponse(503, 'rate_limit_unavailable');
	if (!env.CONTACT_RATE_LIMITER) return jsonResponse(503, 'rate_limit_unavailable');
	try {
		const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: clientIp });
		if (!success) return jsonResponse(429, 'rate_limited');
	} catch {
		return jsonResponse(503, 'rate_limit_unavailable');
	}

	let body: Awaited<ReturnType<typeof readBoundedBody>>;
	try {
		body = await readBoundedBody(request);
	} catch {
		return jsonResponse(400, 'malformed_request');
	}
	if (body.tooLarge) return jsonResponse(413, 'request_too_large');

	let formData: FormData;
	try {
		formData = await new Request(request.url, {
			method: 'POST',
			headers: request.headers,
			body: body.bytes,
		}).formData();
	} catch {
		return jsonResponse(400, 'malformed_request');
	}
	const fields = readFormFields(formData);
	if (!fields) return jsonResponse(400, 'invalid_fields');

	const name = fields.get('name') ?? '';
	const email = fields.get('email') ?? '';
	const topic = fields.get('topic') ?? '';
	const message = fields.get('message') ?? '';
	const honeypot = fields.get('website') ?? '';
	const token = fields.get('cf-turnstile-response') ?? '';

	if (honeypot) return jsonResponse(400, 'spam_detected');
	if (name.length < 2 || name.length > MAX_NAME_LENGTH) return jsonResponse(400, 'invalid_name');
	if (
		email.length > MAX_EMAIL_LENGTH
		|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	) return jsonResponse(400, 'invalid_email');
	if (!Object.hasOwn(CONTACT_ROUTING, topic)) return jsonResponse(400, 'invalid_topic');
	if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
		return jsonResponse(400, 'invalid_message');
	}
	if (!token) return jsonResponse(400, 'captcha_missing');
	if (token.length > MAX_TOKEN_LENGTH) return jsonResponse(400, 'captcha_invalid');

	const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
	if (!turnstileSecret) return jsonResponse(503, 'not_configured');
	const verification = await verifyTurnstile(token, turnstileSecret, clientIp, requestHostname, fetcher);
	if (verification.code) {
		return jsonResponse(
			verification.code === 'captcha_unavailable' ? 503 : 400,
			verification.code,
		);
	}

	const resendApiKey = env.RESEND_API_KEY?.trim();
	const resendFrom = env.RESEND_FROM_EMAIL?.trim();
	if (!resendApiKey || !resendFrom) return jsonResponse(503, 'not_configured');

	const destination = getContactDestination(topic);
	if (!destination) return jsonResponse(400, 'invalid_topic');
	const route = CONTACT_ROUTING[topic as ContactTopic];
	const sender = resendFrom.includes('<') ? resendFrom : `Petalwake Studios <${resendFrom}>`;
	const emailBody = [
		`Name: ${name}`,
		`Email: ${email}`,
		`Topic: ${route.label}`,
		'',
		'Message:',
		message,
	].join('\n');

	try {
		const sendResult = await fetcher('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: sender,
				to: [destination],
				reply_to: email,
				subject: `[Petalwake Studios] ${route.label}`,
				text: emailBody,
			}),
			signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
		});
		if (!sendResult.ok) {
			console.error('Resend email send failed', { status: sendResult.status });
			return jsonResponse(502, 'delivery_failed');
		}
	} catch (error) {
		console.error('Resend email request failed', error instanceof Error ? error.name : 'unknown error');
		return jsonResponse(502, 'delivery_failed');
	}

	return jsonResponse(200, 'sent');
}
