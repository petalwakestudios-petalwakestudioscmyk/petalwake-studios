import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve('dist');
const siteOrigin = 'https://petalwakestudios.com';
const youtubeChannel = 'https://www.youtube.com/@PetalwakeStudios';
const errors = [];
const localizedRoutePairs = {
	'index.html': { en: '/', ja: '/ja/' },
	'ja/index.html': { en: '/', ja: '/ja/' },
	'about/index.html': { en: '/about/', ja: '/ja/about/' },
	'ja/about/index.html': { en: '/about/', ja: '/ja/about/' },
	'contact/index.html': { en: '/contact/', ja: '/ja/contact/' },
	'ja/contact/index.html': { en: '/contact/', ja: '/ja/contact/' },
	'gospel/index.html': { en: '/gospel/', ja: '/ja/gospel/' },
	'ja/gospel/index.html': { en: '/gospel/', ja: '/ja/gospel/' },
	'work/index.html': { en: '/work/', ja: '/ja/work/' },
	'ja/work/index.html': { en: '/work/', ja: '/ja/work/' },
	'work/the-last-winter/index.html': {
		en: '/work/the-last-winter/',
		ja: '/ja/work/the-last-winter/',
	},
	'ja/work/the-last-winter/index.html': {
		en: '/work/the-last-winter/',
		ja: '/ja/work/the-last-winter/',
	},
};

async function listFiles(directory, prefix = '') {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.posix.join(prefix, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(path.join(directory, entry.name), relativePath)));
		} else {
			files.push(relativePath);
		}
	}

	return files;
}

function decodeHtml(value) {
	return value
		.replaceAll('&amp;', '&')
		.replaceAll('&quot;', '"')
		.replaceAll('&apos;', "'")
		.replaceAll('&#39;', "'")
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number(codePoint)))
		.replace(/&#x([0-9a-f]+);/gi, (_, codePoint) =>
			String.fromCodePoint(Number.parseInt(codePoint, 16)),
		);
}

function attributes(tag) {
	return Object.fromEntries(
		[...tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(
			([, key, doubleQuoted, singleQuoted, unquoted]) => [
				key.toLowerCase(),
				decodeHtml(doubleQuoted ?? singleQuoted ?? unquoted ?? ''),
			],
		),
	);
}

function tags(html, expression) {
	return [...html.matchAll(expression)].map(([tag]) => attributes(tag));
}

function textContent(value) {
	return decodeHtml(value.replace(/<[^>]*>/g, '').trim());
}

function localFileForUrl(pathname, files) {
	let decodedPath;
	try {
		decodedPath = decodeURIComponent(pathname);
	} catch {
		return undefined;
	}

	const normalized = decodedPath.startsWith('/') ? decodedPath.slice(1) : decodedPath;
	const candidates = !normalized
		? ['index.html']
		: normalized.endsWith('/')
		? [`${normalized}index.html`]
		: [normalized, `${normalized}/index.html`, `${normalized}.html`];
	return candidates.find((candidate) => files.has(candidate));
}

function error(file, message) {
	errors.push(`${file}: ${message}`);
}

let files;
try {
	files = await listFiles(outputDirectory);
} catch (cause) {
	console.error(`SEO check could not read the production output at ${outputDirectory}. Run astro build first.`);
	throw cause;
}

const fileSet = new Set(files);
const htmlPaths = files.filter((file) => file.endsWith('.html'));
if (htmlPaths.length === 0) {
	throw new Error('No generated HTML pages were found in dist.');
}

const pages = [];
for (const relativePath of htmlPaths) {
	const html = await readFile(path.join(outputDirectory, relativePath), 'utf8');
	const htmlElement = tags(html, /<html\b[^>]*>/gi)[0];
	const titleTags = [...html.matchAll(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/gi)];
	const descriptionTags = tags(
		html,
		/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi,
	);
	const canonicalTags = tags(
		html,
		/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,
	);
	const robotTags = tags(html, /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi);
	const alternateTags = tags(html, /<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi);
	const languageChoiceLinks = tags(
		html,
		/<a\b(?=[^>]*\bdata-language-choice=["'](?:en|ja)["'])[^>]*>/gi,
	);
	const noindex = robotTags.some((tag) => /noindex/i.test(tag.content ?? ''));
	const page = {
		relativePath,
		html,
		language: htmlElement?.lang ?? '',
		title: titleTags.length === 1 ? textContent(titleTags[0][1]) : '',
		description: descriptionTags[0]?.content ?? '',
		canonical: canonicalTags[0]?.href ?? '',
		noindex,
	};
	pages.push(page);

	const expectedLanguage = relativePath.startsWith('ja/') ? 'ja' : 'en';
	if (page.language !== expectedLanguage) {
		error(relativePath, `HTML language must be ${expectedLanguage}; found ${page.language || 'none'}`);
	}
	const languageChoices = new Map(languageChoiceLinks.map((link) => [link['data-language-choice'], link.href]));
	const expectedChoices = localizedRoutePairs[relativePath] ?? { en: '/', ja: '/ja/' };
	for (const locale of ['en', 'ja']) {
		if (languageChoices.get(locale) !== expectedChoices[locale]) {
			error(relativePath, `language selector ${locale} link must point to ${expectedChoices[locale]}`);
		}
	}
	if (languageChoiceLinks.length !== 2) {
		error(relativePath, `expected exactly two language choices; found ${languageChoiceLinks.length}`);
	}
	if (!html.includes('petalwake-language')) {
		error(relativePath, 'language preference persistence script is missing');
	}

	const pairedRoutes = localizedRoutePairs[relativePath];
	if (pairedRoutes) {
		const alternateByLanguage = new Map(alternateTags.map((tag) => [tag.hreflang, tag.href]));
		for (const [locale, pathname] of [
			['en', pairedRoutes.en],
			['ja', pairedRoutes.ja],
			['x-default', pairedRoutes.en],
		]) {
			const expectedUrl = new URL(pathname, siteOrigin).href;
			if (alternateByLanguage.get(locale) !== expectedUrl) {
				error(relativePath, `hreflang ${locale} must point to ${expectedUrl}`);
			}
		}
		if (alternateTags.length !== 3) {
			error(relativePath, `expected exactly three hreflang links; found ${alternateTags.length}`);
		}
	} else if (alternateTags.length > 0) {
		error(relativePath, 'page without a localized counterpart must not advertise hreflang links');
	}

	if (relativePath.startsWith('ja/')) {
		const visibleText = textContent(
			html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''),
		);
		if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(visibleText)) {
			error(relativePath, 'Japanese page does not contain Japanese text');
		}
		for (const untranslated of [
			'Skip to content',
			'Main navigation',
			'Stories That Awaken Wonder.',
			'Home',
			'Films',
			'About',
			'Contact',
			'Watch on YouTube',
			'The Gospel',
			'Explore the Films',
			'Featured work',
			'Featured Film',
			'Watch the film',
			'Enter the story',
			'Explore all films',
			'The story',
			'The complete short film',
			'Play film',
			'Prefer YouTube?',
			'Themes and interpretation',
			'Visual language',
			'Behind the film',
			'Faith and reflection',
			'Further exploration',
			'Carry the conversation further.',
			'Films & visual stories',
			'Visit Petalwake Studios on YouTube',
			'About Petalwake',
			'Stories matter',
			'Start a conversation.',
			'Prepare email',
			'Write directly',
			'Name',
			'Email',
			'Topic',
			'Message',
		]) {
			if (visibleText.includes(untranslated)) {
				error(relativePath, `Japanese page contains untranslated interface text: ${untranslated}`);
			}
		}
	}

	if (titleTags.length !== 1) error(relativePath, `expected exactly one title; found ${titleTags.length}`);
	if (descriptionTags.length !== 1) {
		error(relativePath, `expected exactly one meta description; found ${descriptionTags.length}`);
	}
	if (canonicalTags.length !== 1) {
		error(relativePath, `expected exactly one canonical URL; found ${canonicalTags.length}`);
	}

	if (page.canonical) {
		try {
			const canonicalUrl = new URL(page.canonical);
			if (canonicalUrl.protocol !== 'https:' || canonicalUrl.hostname !== 'petalwakestudios.com') {
				error(relativePath, `canonical must use ${siteOrigin}; found ${page.canonical}`);
			}
			if (canonicalUrl.pathname !== '/' && !canonicalUrl.pathname.endsWith('/')) {
				error(relativePath, `canonical path must use a trailing slash; found ${page.canonical}`);
			}
			if (relativePath === 'index.html' && page.canonical !== `${siteOrigin}/`) {
				error(relativePath, `homepage canonical must be ${siteOrigin}/; found ${page.canonical}`);
			}
		} catch {
			error(relativePath, `invalid canonical URL: ${page.canonical}`);
		}
	}

	for (const [label, expression] of [
		['Open Graph title', /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/gi],
		['Open Graph description', /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/gi],
		['Open Graph URL', /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi],
		['Open Graph image', /<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/gi],
		['Twitter card', /<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>/gi],
	]) {
		const found = tags(html, expression);
		if (found.length !== 1) error(relativePath, `expected exactly one ${label}; found ${found.length}`);
	}

	const ogUrl = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi)[0]?.content;
	if (ogUrl !== page.canonical) error(relativePath, 'Open Graph URL does not match the canonical URL');
	const ogTitle = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/gi)[0]?.content;
	const ogDescription = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/gi)[0]?.content;
	if (ogTitle !== page.title) error(relativePath, 'Open Graph title does not match the page title');
	if (ogDescription !== page.description) error(relativePath, 'Open Graph description does not match the meta description');
	const ogImage = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/gi)[0]?.content;
	const ogImageAlt = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:image:alt["'])[^>]*>/gi)[0]?.content;
	const ogImageWidth = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:image:width["'])[^>]*>/gi)[0]?.content;
	const ogImageHeight = tags(html, /<meta\b(?=[^>]*\bproperty=["']og:image:height["'])[^>]*>/gi)[0]?.content;
	if (!ogImageAlt) error(relativePath, 'Open Graph image is missing descriptive alt text');
	if (!/^\d+$/.test(ogImageWidth ?? '') || !/^\d+$/.test(ogImageHeight ?? '')) {
		error(relativePath, 'Open Graph image dimensions must be positive integers');
	}
	if (ogImage) {
		try {
			const imageUrl = new URL(ogImage);
			if (imageUrl.protocol !== 'https:' || imageUrl.hostname !== 'petalwakestudios.com') {
				error(relativePath, `Open Graph image must use the production HTTPS host: ${ogImage}`);
			}
			if (!localFileForUrl(imageUrl.pathname, fileSet)) {
				error(relativePath, `Open Graph image does not resolve in the build output: ${ogImage}`);
			}
		} catch {
			error(relativePath, `Open Graph image must be an absolute URL: ${ogImage}`);
		}
	}
	const twitterCard = tags(html, /<meta\b(?=[^>]*\bname=["']twitter:card["'])[^>]*>/gi)[0]?.content;
	if (twitterCard !== 'summary_large_image') {
		error(relativePath, `Twitter card must be summary_large_image; found ${twitterCard ?? 'none'}`);
	}
	const twitterTitle = tags(html, /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/gi)[0]?.content;
	const twitterDescription = tags(html, /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/gi)[0]?.content;
	const twitterImage = tags(html, /<meta\b(?=[^>]*\bname=["']twitter:image["'])[^>]*>/gi)[0]?.content;
	if (twitterTitle !== page.title) error(relativePath, 'Twitter title does not match the page title');
	if (twitterDescription !== page.description) error(relativePath, 'Twitter description does not match the meta description');
	if (twitterImage !== ogImage) error(relativePath, 'Twitter image does not match the Open Graph image');

	const headings = [...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi)];
	if (headings.length !== 1) error(relativePath, `expected exactly one H1; found ${headings.length}`);
	if (headings[0] && /\bclass=["'][^"']*\bsr-only\b|\bhidden\b/i.test(headings[0][1])) {
		error(relativePath, 'H1 must be visible in the rendered page');
	}
	if ([...html.matchAll(/<main\b/gi)].length !== 1) error(relativePath, 'expected exactly one main landmark');

	for (const img of tags(html, /<img\b[^>]*>/gi)) {
		if (!Object.hasOwn(img, 'alt')) error(relativePath, 'image is missing an alt attribute');
	}

	const parsedData = [];
	for (const script of html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)) {
		try {
			parsedData.push(JSON.parse(script[1]));
		} catch {
			error(relativePath, 'JSON-LD script is not valid JSON');
		}
	}
	const organizationCount = parsedData.filter((entity) => entity?.['@type'] === 'Organization').length;
	if (organizationCount !== 1) {
		error(relativePath, `expected one Organization JSON-LD entity; found ${organizationCount}`);
	}
	const organization = parsedData.find((entity) => entity?.['@type'] === 'Organization');
	if (organization) {
		if (organization['@id'] !== `${siteOrigin}/#organization`) {
			error(relativePath, 'Organization JSON-LD is missing its stable @id');
		}
		if (!organization.sameAs?.includes(youtubeChannel)) {
			error(relativePath, 'Organization JSON-LD is missing the verified YouTube channel');
		}
	}

	if (/example\.com|localhost|workers\.dev|github\.dev/i.test(html)) {
		error(relativePath, 'generated HTML contains a placeholder or preview hostname');
	}
	if (/Petal\s+Wake|Petal\s+Wak/i.test(html)) error(relativePath, 'generated HTML contains an incorrect brand spelling');
	if (/music\s+studio|music\s+producer|record\s+label/i.test(html)) {
		error(relativePath, 'generated HTML contains prohibited music-project terminology');
	}

	for (const anchor of tags(html, /<a\b[^>]*>/gi)) {
		const href = anchor.href;
		if (!href) {
			error(relativePath, 'anchor is missing an href');
			continue;
		}
		if (/^javascript:/i.test(href)) error(relativePath, `JavaScript-only link is not crawlable: ${href}`);
		if (anchor.target === '_blank' && !/\bnoopener\b/.test(anchor.rel ?? '')) {
			error(relativePath, `new-tab link is missing rel="noopener": ${href}`);
		}
		if (anchor.target === '_blank' && !/\bnoreferrer\b/.test(anchor.rel ?? '')) {
			error(relativePath, `new-tab link is missing rel="noreferrer": ${href}`);
		}
		if (href.startsWith('#')) {
			if (!new RegExp(`\\bid=["']${href.slice(1)}["']`).test(html)) {
				error(relativePath, `anchor target does not exist: ${href}`);
			}
		}
	}

	for (const tag of tags(html, /<(?:a|img|link)\b[^>]*>/gi)) {
		const values = [];
		if (tag.href && (tag.rel === 'canonical' || tag.rel === 'icon' || tag.rel === 'apple-touch-icon' || tag.rel === 'preload' || tag.href.startsWith('/'))) {
			values.push(tag.href);
		}
		if (tag.src) values.push(tag.src);
		if (tag.srcset) {
			values.push(...tag.srcset.split(',').map((entry) => entry.trim().split(/\s+/)[0]));
		}

		for (const value of values) {
			if (!value.startsWith('/') || value.startsWith('//')) continue;
			const url = new URL(value, siteOrigin);
			const localPath = localFileForUrl(url.pathname, fileSet);
			if (!localPath) {
				error(relativePath, `local resource or link does not resolve: ${value}`);
				continue;
			}
			if (url.hash && localPath.endsWith('.html')) {
				const linkedHtml = localPath === relativePath ? html : await readFile(path.join(outputDirectory, localPath), 'utf8');
				const id = decodeURIComponent(url.hash.slice(1));
				if (!new RegExp(`\\bid=["']${id}["']`).test(linkedHtml)) {
					error(relativePath, `local link target does not exist: ${value}`);
				}
			}
		}
	}
}

const indexablePages = pages.filter((page) => !page.noindex);
const titles = new Map();
const descriptions = new Map();
for (const page of indexablePages) {
	for (const [value, collection, label] of [
		[page.title, titles, 'title'],
		[page.description, descriptions, 'description'],
	]) {
		const previousPath = collection.get(value);
		if (!value) {
			error(page.relativePath, `indexable page is missing its ${label}`);
		} else if (previousPath) {
			error(page.relativePath, `duplicate ${label} also used by ${previousPath}`);
		} else {
			collection.set(value, page.relativePath);
		}
	}
	if (/noindex/i.test(page.html)) error(page.relativePath, 'indexable page is accidentally marked noindex');
}

const sitemapIndexPath = path.join(outputDirectory, 'sitemap-index.xml');
const robotsPath = path.join(outputDirectory, 'robots.txt');
try {
	await access(sitemapIndexPath);
} catch {
	error('dist', 'sitemap-index.xml is missing');
}

let robots = '';
try {
	robots = await readFile(robotsPath, 'utf8');
} catch {
	error('robots.txt', 'file is missing from the production build');
}
if (robots) {
	if (!/^User-agent:\s*\*\s*$/m.test(robots)) error('robots.txt', 'missing wildcard user-agent directive');
	if (!/^Allow:\s*\/\s*$/m.test(robots)) error('robots.txt', 'missing Allow: / directive');
	if (!new RegExp(`^Sitemap:\\s*${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap-index\\.xml\\s*$`, 'm').test(robots)) {
		error('robots.txt', 'sitemap reference must use the production sitemap index URL');
	}
}

const sitemapFiles = files.filter((file) => /^sitemap-\d+\.xml$/.test(file));
if (sitemapFiles.length === 0) error('dist', 'no generated sitemap page files were found');
const sitemapUrls = new Set();
for (const sitemapFile of sitemapFiles) {
	const xml = await readFile(path.join(outputDirectory, sitemapFile), 'utf8');
	for (const [, url] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
		const decodedUrl = decodeHtml(url);
		sitemapUrls.add(decodedUrl);
		if (!decodedUrl.startsWith(`${siteOrigin}/`)) {
			error(sitemapFile, `sitemap URL does not use the production canonical hostname: ${decodedUrl}`);
		}
	}
}
const canonicalUrls = new Set(indexablePages.map((page) => page.canonical));
for (const page of indexablePages) {
	if (!sitemapUrls.has(page.canonical)) error(page.relativePath, `canonical is missing from the sitemap: ${page.canonical}`);
}
for (const pathname of Object.values(localizedRoutePairs).map((pair) => pair.ja)) {
	const localizedUrl = new URL(pathname, siteOrigin).href;
	if (!sitemapUrls.has(localizedUrl)) error('sitemap', `Japanese URL is missing: ${localizedUrl}`);
}
for (const sitemapUrl of sitemapUrls) {
	if (!canonicalUrls.has(sitemapUrl)) error('sitemap', `URL has no matching indexable page: ${sitemapUrl}`);
}

if (errors.length > 0) {
	console.error(`SEO validation failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
	for (const issue of errors) console.error(`- ${issue}`);
	process.exitCode = 1;
} else {
	console.log(`SEO validation passed for ${indexablePages.length} indexable page(s) and ${pages.length - indexablePages.length} noindex page(s).`);
}
