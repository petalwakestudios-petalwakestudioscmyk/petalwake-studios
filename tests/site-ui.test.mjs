import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const headSource = await readFile(new URL('../src/components/BaseHead.astro', import.meta.url), 'utf8');
const headerSource = await readFile(new URL('../src/components/SiteHeader.astro', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles/studio.css', import.meta.url), 'utf8');
const contactClient = await readFile(new URL('../src/scripts/contact-form.ts', import.meta.url), 'utf8');
const englishContact = await readFile(new URL('../src/pages/contact.astro', import.meta.url), 'utf8');
const japaneseContact = await readFile(new URL('../src/pages/ja/contact.astro', import.meta.url), 'utf8');

function runAppearanceScript({ savedPreference, systemDark = false } = {}) {
	const inlineScript = headSource.match(/<script is:inline>\s*([\s\S]*?)\s*<\/script>/)?.[1];
	assert.ok(inlineScript, 'the early appearance script must be present');

	const values = new Map(savedPreference ? [['petalwake-appearance', savedPreference]] : []);
	const listeners = new Map();
	const dispatched = [];
	const media = {
		matches: systemDark,
		addEventListener(type, callback) {
			listeners.set(type, callback);
		},
	};
	const document = {
		documentElement: { dataset: {} },
		querySelector() {
			return { setAttribute() {} };
		},
		addEventListener() {},
	};
	const window = {
		matchMedia: () => media,
		addEventListener() {},
		dispatchEvent(event) {
			dispatched.push(event);
		},
	};
	const localStorage = {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value),
		removeItem: (key) => values.delete(key),
	};

	vm.runInNewContext(inlineScript, {
		document,
		window,
		localStorage,
		CustomEvent: class CustomEvent {
			constructor(type, init) {
				this.type = type;
				this.detail = init.detail;
			}
		},
		console,
	});

	return { document, dispatched, listeners, localStorage, media, values, window };
}

test('appearance follows the system until a visitor chooses a theme, then persists', () => {
	const systemDark = runAppearanceScript({ systemDark: true });
	assert.equal(systemDark.document.documentElement.dataset.theme, 'dark');
	assert.equal(systemDark.document.documentElement.dataset.themeChoice, 'system');

	systemDark.media.matches = false;
	systemDark.listeners.get('change')();
	assert.equal(systemDark.document.documentElement.dataset.theme, 'light');

	systemDark.window.petalwakeAppearance.setPreference('dark');
	assert.equal(systemDark.document.documentElement.dataset.theme, 'dark');
	assert.equal(systemDark.values.get('petalwake-appearance'), 'dark');
	assert.equal(systemDark.dispatched.at(-1).detail.theme, 'dark');
	assert.equal(systemDark.dispatched.at(-1).detail.choice, 'dark');

	systemDark.media.matches = false;
	systemDark.listeners.get('change')();
	assert.equal(systemDark.document.documentElement.dataset.theme, 'dark');

	systemDark.window.petalwakeAppearance.setPreference('system');
	assert.equal(systemDark.values.has('petalwake-appearance'), false);
	assert.equal(systemDark.document.documentElement.dataset.theme, 'light');
});

test('the header keeps language and theme controls outside a compact, accessible menu', () => {
	assert.match(headerSource, /class="language-switch"/);
	assert.match(headerSource, /data-appearance-toggle/);
	assert.match(headerSource, /aria-pressed="false"/);
	assert.match(headerSource, /data-menu-toggle/);
	assert.match(headerSource, /aria-expanded="false"/);
	assert.match(headerSource, /data-close-label=\{labels\.closeMenu\}/);
	assert.doesNotMatch(headerSource, /<details[^>]*open/);
	assert.doesNotMatch(headerSource, /data-appearance-select/);
	assert.match(headerSource, /event\.key === 'Escape'/);
	assert.match(headerSource, /navigationLinks\?\.querySelectorAll/);
	assert.match(headerSource, /!navigation\.contains\(event\.target\)/);
	assert.match(headerSource, /menuButton\.setAttribute\(\s*'aria-expanded', String\(open\)/);
	assert.match(styles, /\.site-nav__links\s*\{[^}]*display:\s*none/);
	assert.match(styles, /\.site-nav\[data-open="true"\] \.site-nav__links\s*\{\s*display:\s*flex/);
	assert.match(headerSource, /setNavigationOpen\(false\);/);
	assert.doesNotMatch(headerSource, /navigationBreakpoint|matchMedia/);
	assert.match(headerSource, /if \(event\.key === 'Escape' && navigation\?\.dataset\.open === 'true'\)/);
	assert.doesNotMatch(headerSource, /menuButton\.hidden\s*=/);
	assert.match(styles, /@media \(max-width: 360px\)/);
	assert.match(styles, /html\[data-theme="dark"\] \.site-nav__links/);
});

test('English and Japanese contact pages include a localized CAPTCHA retry control', () => {
	for (const [page, label] of [[englishContact, 'Retry security check'], [japaneseContact, 'retryTurnstile']]) {
		assert.match(page, /data-turnstile-retry/);
		assert.match(page, new RegExp(label));
		assert.match(page, /action="\/api\/contact"/);
	}
	assert.match(contactClient, /function loadTurnstileScript\(\)/);
	assert.match(contactClient, /showCaptchaFailure\('captcha_script_failed'\)/);
	assert.match(contactClient, /isSubmitting/);
	assert.match(contactClient, /formData\.set\('cf-turnstile-response', token\)/);
	assert.match(contactClient, /window\.turnstile\.reset\(widgetId\)/);
	assert.match(contactClient, /setSubmitDisabled\(false\)/);
});
