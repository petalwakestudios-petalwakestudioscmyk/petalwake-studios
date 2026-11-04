import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const workerDirectory = 'dist/_worker.js';
const routeManifest = JSON.parse(await readFile('dist/_routes.json', 'utf8'));
const apiRouteModule = await readFile(
	join(workerDirectory, 'pages/api/contact.astro.mjs'),
	'utf8',
);

function matchesRoute(pattern, route) {
	const expression = new RegExp(
		`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')}/?$`,
	);
	return expression.test(route);
}

assert.ok(
	routeManifest.include.some((pattern) => matchesRoute(pattern, '/api/contact')),
	'Cloudflare routes must include /api/contact',
);
assert.ok(
	!routeManifest.exclude.some((pattern) => matchesRoute(pattern, '/api/contact')),
	'Cloudflare routes must not exclude /api/contact',
);
assert.ok(
	apiRouteModule.length > 100 && !apiRouteModule.includes('Contents removed by Astro'),
	'Astro must emit an on-demand API route module instead of a prerender placeholder',
);

async function listWorkerModules(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(entries.map(async (entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory()
			? listWorkerModules(path)
			: path.endsWith('.mjs') ? [path] : [];
	}));
	return nested.flat();
}

const workerModules = await listWorkerModules(workerDirectory);
const workerSource = (await Promise.all(workerModules.map((path) => readFile(path, 'utf8')))).join('\n');
for (const marker of ['invalid_content_type', 'captcha_missing', 'siteverify', 'api.resend.com/emails']) {
	assert.ok(workerSource.includes(marker), `Generated Worker is missing contact-handler marker: ${marker}`);
}

for (const route of ['contact', 'ja/contact']) {
	await readFile(join('dist', route, 'index.html'), 'utf8');
}
for (const route of ['contact', 'ja/contact']) {
	const html = await readFile(join('dist', route, 'index.html'), 'utf8');
	assert.ok(html.includes('action="/api/contact"'), `${route} form must submit to /api/contact`);
}

console.log('Cloudflare Worker contact route validation passed.');
