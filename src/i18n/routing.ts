export type Locale = 'en' | 'ja';

const englishRoutes = new Set([
	'/',
	'/work/',
	'/work/the-last-winter/',
	'/about/',
	'/contact/',
	'/gospel/',
	'/films/the-last-winter/',
]);

export function localeFromPath(pathname: string): Locale {
	return pathname === '/ja' || pathname.startsWith('/ja/') ? 'ja' : 'en';
}

export function localizedPath(pathname: string, locale: Locale): string {
	const englishPath = localeFromPath(pathname) === 'ja'
		? pathname.replace(/^\/ja(?=\/|$)/, '') || '/'
		: pathname;

	if (!englishRoutes.has(englishPath)) return locale === 'ja' ? '/ja/' : '/';
	if (locale === 'en') return englishPath;
	return englishPath === '/' ? '/ja/' : `/ja${englishPath}`;
}

export const pairedEnglishRoutes = [...englishRoutes].filter(
	(pathname) => pathname !== '/films/the-last-winter/',
);
