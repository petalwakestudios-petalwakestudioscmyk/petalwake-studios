import type { Locale } from '../i18n/routing';

export type MangaCoverStyle = 'rain' | 'petals' | 'light' | 'mountains' | 'letters' | 'sea';

export interface MangaProject {
	id: string;
	number: string;
	title: string;
	titleJa: string;
	category: 'original-manga';
	status: 'coming-soon';
	coverStyle: MangaCoverStyle;
	coverImage?: string;
	coverAlt?: Partial<Record<Locale, string>>;
	description?: Partial<Record<Locale, string>>;
	href?: string;
}

export const MANGA_PROJECTS: MangaProject[] = [
	{ id: 'after-the-rain', number: '01', title: 'After the Rain', titleJa: '雨のあと', category: 'original-manga', status: 'coming-soon', coverStyle: 'rain' },
	{ id: 'petals-at-dawn', number: '02', title: 'Petals at Dawn', titleJa: '夜明けの花びら', category: 'original-manga', status: 'coming-soon', coverStyle: 'petals' },
	{ id: 'the-last-light', number: '03', title: 'The Last Light', titleJa: '最後の光', category: 'original-manga', status: 'coming-soon', coverStyle: 'light' },
	{ id: 'where-the-mountains-sleep', number: '04', title: 'Where the Mountains Sleep', titleJa: '山々が眠る場所', category: 'original-manga', status: 'coming-soon', coverStyle: 'mountains' },
	{ id: 'letters-never-sent', number: '05', title: 'Letters Never Sent', titleJa: '届かなかった手紙', category: 'original-manga', status: 'coming-soon', coverStyle: 'letters' },
	{ id: 'beyond-the-quiet-sea', number: '06', title: 'Beyond the Quiet Sea', titleJa: '静かな海の向こう', category: 'original-manga', status: 'coming-soon', coverStyle: 'sea' },
];
