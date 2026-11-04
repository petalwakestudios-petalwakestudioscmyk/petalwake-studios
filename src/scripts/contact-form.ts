import { CONTACT_RESPONSE_CODES, CONTACT_TOPICS, type ContactResponseCode } from '../lib/contact-contract';
import { contactMessages } from '../i18n/contact-messages';
import type { Locale } from '../i18n/routing';

interface TurnstileApi {
	render(
		container: string,
		options: {
			sitekey: string;
			theme: 'light' | 'dark';
			appearance: 'always';
			action: 'contact';
			language: Locale;
			callback: () => void;
			'expired-callback': () => void;
			'error-callback': () => void;
		},
	): string;
	getResponse(widgetId: string): string;
	reset(widgetId: string): void;
	remove(widgetId: string): void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

const form = document.querySelector<HTMLFormElement>('#contact-form');
const status = document.querySelector<HTMLElement>('#contact-form-status');
const submitButton = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
const retryButton = form?.querySelector<HTMLButtonElement>('[data-turnstile-retry]');
const siteKey = form?.dataset.turnstileSiteKey ?? '';
const locale: Locale = form?.dataset.locale === 'ja' ? 'ja' : 'en';
const messages = contactMessages[locale];
let widgetId: string | null = null;
let widgetScriptLoaded = false;
let widgetScriptLoading = false;
let isSubmitting = false;

function setStatus(code: keyof typeof messages, state: 'error' | 'success' | 'info' = 'error') {
	if (!status) return;
	status.textContent = messages[code];
	status.dataset.state = state;
}

function setSubmitDisabled(disabled: boolean) {
	if (submitButton) submitButton.disabled = disabled;
}

function showRetry(visible: boolean) {
	if (retryButton) retryButton.hidden = !visible;
}

function showCaptchaFailure(
	code: 'captcha_unavailable' | 'captcha_script_failed' | 'not_configured',
) {
	setStatus(code);
	showRetry(code !== 'not_configured');
	setSubmitDisabled(false);
}

function renderTurnstile() {
	if (!form || !window.turnstile || !siteKey) {
		showCaptchaFailure(siteKey ? 'captcha_unavailable' : 'not_configured');
		return;
	}
	try {
		widgetId = window.turnstile.render('#contact-turnstile', {
			sitekey: siteKey,
			theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
			appearance: 'always',
			action: 'contact',
			language: locale,
			callback: () => {
				showRetry(false);
				if (status?.dataset.state === 'error' || status?.dataset.state === 'info') {
					status.textContent = '';
					delete status.dataset.state;
				}
			},
			'expired-callback': () => setStatus('captcha_invalid'),
			'error-callback': () => showCaptchaFailure('captcha_unavailable'),
		});
		showRetry(false);
	} catch {
		widgetId = null;
		showCaptchaFailure('captcha_unavailable');
	}
}

function loadTurnstileScript() {
	if (!siteKey) {
		setStatus('not_configured');
		showRetry(false);
		return;
	}
	if (widgetScriptLoading) return;
	if (window.turnstile) {
		widgetScriptLoaded = true;
		renderTurnstile();
		return;
	}

	widgetScriptLoading = true;
	const script = document.createElement('script');
	script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&language=${locale}`;
	script.async = true;
	script.defer = true;
	script.onload = () => {
		widgetScriptLoading = false;
		widgetScriptLoaded = true;
		renderTurnstile();
	};
	script.onerror = () => {
		widgetScriptLoading = false;
		script.remove();
		showCaptchaFailure('captcha_script_failed');
	};
	document.head.appendChild(script);
}

retryButton?.addEventListener('click', () => {
	showRetry(false);
	setStatus('captcha_retrying', 'info');
	if (widgetId && window.turnstile) {
		window.turnstile.remove(widgetId);
		widgetId = null;
	}
	loadTurnstileScript();
});

if (siteKey) loadTurnstileScript();
else setStatus('not_configured');

window.addEventListener('petalwake:themechange', () => {
	if (!widgetScriptLoaded || !window.turnstile) return;
	if (widgetId) window.turnstile.remove(widgetId);
	widgetId = null;
	renderTurnstile();
});

form?.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!form || isSubmitting) return;

	const formData = new FormData(form);
	const name = String(formData.get('name') ?? '').trim();
	const email = String(formData.get('email') ?? '').trim();
	const topic = String(formData.get('topic') ?? '').trim();
	const message = String(formData.get('message') ?? '').trim();
	const honeypot = String(formData.get('website') ?? '').trim();

	if (honeypot) {
		setStatus('spam_detected');
		return;
	}
	if (name.length < 2 || name.length > 120) {
		setStatus('invalid_name');
		return;
	}
	if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		setStatus('invalid_email');
		return;
	}
	if (!CONTACT_TOPICS.includes(topic as (typeof CONTACT_TOPICS)[number])) {
		setStatus('invalid_topic');
		return;
	}
	if (message.length < 10 || message.length > 2500) {
		setStatus('invalid_message');
		return;
	}
	if (!widgetId || !window.turnstile) {
		setStatus(siteKey ? 'captcha_unavailable' : 'not_configured');
		return;
	}
	let token: string;
	try {
		token = window.turnstile.getResponse(widgetId);
	} catch {
		showCaptchaFailure('captcha_unavailable');
		return;
	}
	if (!token) {
		setStatus('captcha_missing');
		return;
	}

	isSubmitting = true;
	setSubmitDisabled(true);
	setStatus('sending', 'info');
	formData.set('cf-turnstile-response', token);

	try {
		const response = await fetch(form.action, {
			method: 'POST',
			body: formData,
			headers: { Accept: 'application/json' },
		});
		const result: { code?: string } = await response.json();
		const code = CONTACT_RESPONSE_CODES.find((candidate) => candidate === result.code);
		if (!response.ok || !code) {
			setStatus(code ?? 'delivery_failed');
			if (widgetId) window.turnstile.reset(widgetId);
			return;
		}
		setStatus(code, 'success');
		form.reset();
		if (widgetId) window.turnstile.reset(widgetId);
	} catch {
		setStatus('delivery_failed');
		if (widgetId) window.turnstile.reset(widgetId);
	} finally {
		isSubmitting = false;
		setSubmitDisabled(false);
	}
});

form?.addEventListener('input', () => {
	if (status?.dataset.state === 'error' || status?.dataset.state === 'info') {
		status.textContent = '';
		delete status.dataset.state;
	}
});
