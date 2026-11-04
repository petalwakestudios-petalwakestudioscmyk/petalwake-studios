import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CONTACT_RESPONSE_CODES, CONTACT_TOPICS } from '../src/lib/contact-contract.ts';
import { contactTopicLabels } from '../src/i18n/contact-topics.ts';
import { PRIVATE_EMAIL_ADDRESSES, getContactDestination } from '../src/server/contact-routing.ts';
import { handleContactPost } from '../src/server/contact-handler.ts';
import { createContactPost } from '../src/pages/api/contact.ts';
import { contactMessages } from '../src/i18n/contact-messages.ts';

const expectedRoutes = {
	general: 'hello@petalwakestudios.com',
	ministry: 'ministry@petalwakestudios.com',
	japan: 'japan@petalwakestudios.com',
	media: 'media@petalwakestudios.com',
	collaboration: 'contact@petalwakestudios.com',
	other: 'contact@petalwakestudios.com',
};

function createRequest(fields = {}, headers = {}) {
	const formData = new FormData();
	for (const [key, value] of Object.entries({
		name: 'Test Visitor',
		email: 'visitor@example.net',
		topic: 'general',
		message: 'A sufficiently long test message.',
		'cf-turnstile-response': 'test-token',
		...fields,
	})) {
		formData.set(key, value);
	}
	return new Request('https://petalwakestudios.com/api/contact', {
		method: 'POST',
		headers: { 'cf-connecting-ip': '203.0.113.10', ...headers },
		body: formData,
	});
}

function createEnvironment({ rateLimitSuccess = true } = {}) {
	const rateLimitKeys = [];
	return {
		rateLimitKeys,
		env: {
			ENVIRONMENT: 'production',
			TURNSTILE_SECRET_KEY: 'test-secret',
			RESEND_API_KEY: 'test-api-key',
			RESEND_FROM_EMAIL: 'noreply@petalwakestudios.com',
			CONTACT_RATE_LIMITER: {
				async limit({ key }) {
					rateLimitKeys.push(key);
					return { success: rateLimitSuccess };
				},
			},
		},
	};
}

function createSuccessfulFetch(calls = []) {
	return async (url, init) => {
		calls.push({ url: String(url), init });
		if (String(url).includes('/siteverify')) {
			return Response.json({
				success: true,
				hostname: 'petalwakestudios.com',
				action: 'contact',
			});
		}
		return Response.json({ id: 'test-email-id' }, { status: 200 });
	};
}

async function responseCode(response) {
	return (await response.json()).code;
}

test('all six private addresses are centralized and topic routing is exact', () => {
	assert.deepEqual(Object.values(PRIVATE_EMAIL_ADDRESSES).sort(), [
		'contact@petalwakestudios.com',
		'hello@petalwakestudios.com',
		'info@petalwakestudios.com',
		'japan@petalwakestudios.com',
		'media@petalwakestudios.com',
		'ministry@petalwakestudios.com',
	].sort());
	assert.deepEqual(Object.fromEntries(CONTACT_TOPICS.map((topic) => [topic, getContactDestination(topic)])), expectedRoutes);
	assert.equal(getContactDestination('visitor@example.net'), undefined);
	assert.equal(getContactDestination('toString'), undefined);
});

test('English and Japanese labels share the same stable topic identifiers and both submit', async (t) => {
	assert.deepEqual(Object.keys(contactTopicLabels.en), CONTACT_TOPICS);
	assert.deepEqual(Object.keys(contactTopicLabels.ja), CONTACT_TOPICS);
	for (const locale of ['en', 'ja']) {
		await t.test(`${locale} form sends the general identifier`, async () => {
			const { env } = createEnvironment();
			const calls = [];
			const response = await handleContactPost(
				createRequest({ topic: 'general' }, { 'accept-language': locale }),
				env,
				createSuccessfulFetch(calls),
			);
			assert.equal(response.status, 200);
			assert.equal(await responseCode(response), 'sent');
			assert.deepEqual(JSON.parse(calls.find((call) => call.url.includes('api.resend.com')).init.body).to, [
				'hello@petalwakestudios.com',
			]);
		});
	}
	assert.equal(contactMessages.en.sent.length > 0, true);
	assert.equal(contactMessages.ja.sent.length > 0, true);
});

test('Astro API route delegates requests and mocked verification to the contact handler', async (t) => {
	const { env } = createEnvironment();
	const calls = [];
	const post = createContactPost(createSuccessfulFetch(calls));
	const locals = { runtime: { env } };

	await t.test('rejects invalid content before external calls', async () => {
		const response = await post({
			request: new Request('https://petalwakestudios.com/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}',
			}),
			locals,
		});
		assert.equal(response.status, 415);
		assert.equal(calls.length, 0);
	});

	await t.test('valid submissions reach mocked Siteverify and email delivery', async () => {
		const response = await post({
			request: createRequest(),
			locals,
		});
		assert.equal(response.status, 200);
		assert.equal(await responseCode(response), 'sent');
		assert.equal(calls.some(({ url }) => url.includes('/siteverify')), true);
		const resendRequest = calls.find(({ url }) => url.includes('api.resend.com/emails'));
		assert.ok(resendRequest);
		assert.equal(resendRequest.init.headers.Authorization, `Bearer ${env.RESEND_API_KEY}`);
		const emailPayload = JSON.parse(resendRequest.init.body);
		assert.equal(emailPayload.reply_to, 'visitor@example.net');
		assert.notEqual(emailPayload.from, emailPayload.reply_to);
	});
});

test('rejects invalid topics and never uses a supplied recipient', async () => {
	const { env } = createEnvironment();
	const calls = [];
	const response = await handleContactPost(
		createRequest({ topic: 'hello@petalwakestudios.com', recipient: 'attacker@example.net' }),
		env,
		createSuccessfulFetch(calls),
	);
	assert.equal(response.status, 400);
	assert.equal(await responseCode(response), 'invalid_fields');
	assert.equal(calls.length, 0);

	const invalidTopicResponse = await handleContactPost(
		createRequest({ topic: 'Hello@petalwakestudios.com' }),
		env,
		createSuccessfulFetch(),
	);
	assert.equal(await responseCode(invalidTopicResponse), 'invalid_topic');
});

test('rejects missing and invalid, expired, or replayed CAPTCHA tokens', async (t) => {
	await t.test('missing token', async () => {
		const { env } = createEnvironment();
		const response = await handleContactPost(
			createRequest({ 'cf-turnstile-response': '' }),
			env,
			createSuccessfulFetch(),
		);
		assert.equal(await responseCode(response), 'captcha_missing');
	});
	for (const scenario of ['invalid', 'expired-or-reused']) {
		await t.test(scenario, async () => {
			const { env } = createEnvironment();
			const response = await handleContactPost(
				createRequest(),
				env,
				async () => Response.json({
					success: false,
					'error-codes': [scenario === 'invalid' ? 'invalid-input-response' : 'timeout-or-duplicate'],
				}),
			);
			assert.equal(await responseCode(response), 'captcha_invalid');
		});
	}
});

test('requires the expected Turnstile hostname and action', async (t) => {
	for (const [field, value, code] of [
		['hostname', 'attacker.example', 'captcha_hostname_mismatch'],
		['action', 'other', 'captcha_action_mismatch'],
	]) {
		await t.test(field, async () => {
			const { env } = createEnvironment();
			const response = await handleContactPost(
				createRequest(),
				env,
				async () => Response.json({
					success: true,
					hostname: field === 'hostname' ? value : 'petalwakestudios.com',
					action: field === 'action' ? value : 'contact',
				}),
			);
			assert.equal(await responseCode(response), code);
		});
	}
});

test('Turnstile service errors and timeouts fail closed', async (t) => {
	for (const fetcher of [
		async () => new Response('unavailable', { status: 503 }),
		async () => {
			throw new Error('simulated timeout');
		},
	]) {
		await t.test('service failure', async () => {
			const { env } = createEnvironment();
			const response = await handleContactPost(createRequest(), env, fetcher);
			assert.equal(response.status, 503);
			assert.equal(await responseCode(response), 'captcha_unavailable');
		});
	}
});

test('rate limits by trusted CF-Connecting-IP and fails closed if unavailable', async () => {
	const { env, rateLimitKeys } = createEnvironment();
	const limitedEnvironment = createEnvironment({ rateLimitSuccess: false }).env;
	const limited = await handleContactPost(
		createRequest({}, { 'x-forwarded-for': '198.51.100.99' }),
		limitedEnvironment,
		createSuccessfulFetch(),
	);
	assert.equal(limited.status, 429);
	assert.equal(await responseCode(limited), 'rate_limited');

	const allowed = await handleContactPost(
		createRequest({}, { 'x-forwarded-for': '198.51.100.99' }),
		env,
		createSuccessfulFetch(),
	);
	assert.equal(allowed.status, 200);
	assert.deepEqual(rateLimitKeys, ['203.0.113.10']);

	const unavailable = await handleContactPost(
		createRequest({}, { 'cf-connecting-ip': '' }),
		{ ...env, CONTACT_RATE_LIMITER: undefined },
		createSuccessfulFetch(),
	);
	assert.equal(await responseCode(unavailable), 'rate_limit_unavailable');
});

test('checks content type and request length before parsing the body', async (t) => {
	await t.test('rejects wrong content type', async () => {
		const response = await handleContactPost(new Request(
			'https://petalwakestudios.com/api/contact',
			{ method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' },
		), createEnvironment().env);
		assert.equal(response.status, 415);
		assert.equal(await responseCode(response), 'invalid_content_type');
	});

	await t.test('rejects oversized declared length before accessing the body', async () => {
		const request = new Request('https://petalwakestudios.com/api/contact', {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'content-length': '20000',
			},
			body: 'small=body',
		});
		const response = await handleContactPost(request, createEnvironment().env);
		assert.equal(response.status, 413);
		assert.equal(await responseCode(response), 'request_too_large');
	});
});

test('validates required fields, field limits, and the honeypot', async (t) => {
	const cases = [
		['missing name', { name: '' }, 'invalid_name'],
		['missing email', { email: '' }, 'invalid_email'],
		['missing topic', { topic: '' }, 'invalid_topic'],
		['missing message', { message: '' }, 'invalid_message'],
		['long name', { name: 'n'.repeat(121) }, 'invalid_name'],
		['long email', { email: `${'a'.repeat(244)}@example.net` }, 'invalid_email'],
		['long message', { message: 'm'.repeat(2501) }, 'invalid_message'],
		['honeypot', { website: 'filled by a bot' }, 'spam_detected'],
	];
	for (const [label, fields, expectedCode] of cases) {
		await t.test(label, async () => {
			const response = await handleContactPost(
				createRequest(fields),
				createEnvironment().env,
				createSuccessfulFetch(),
			);
			assert.equal(response.status, 400);
			assert.equal(await responseCode(response), expectedCode);
		});
	}
});

test('English and Japanese contact pages render the shared topic identifiers', async () => {
	const [english, japanese] = await Promise.all([
		readFile(new URL('../src/pages/contact.astro', import.meta.url), 'utf8'),
		readFile(new URL('../src/pages/ja/contact.astro', import.meta.url), 'utf8'),
	]);
	for (const [page, locale] of [[english, 'en'], [japanese, 'ja']]) {
		assert.match(page, /CONTACT_TOPICS\.map/);
		assert.match(page, new RegExp(`<option value={topic}>{contactTopicLabels\\.${locale}\\[topic\\]}</option>`));
		assert.doesNotMatch(page, /value=\{contactTopicLabels/);
		assert.match(page, /data-locale=/);
		assert.match(page, /contact-form\.ts/);
	}
});
