export type ArtworkCollection = 'Little Lights' | 'Eternal Light';

export interface ArtworkItem {
	id: string;
	title: string;
	collection: ArtworkCollection;
	image: string;
	thumbnail: string;
	mediumThumbnail: string;
	alt: string;
	scriptureReference?: string;
	featured: boolean;
	order: number;
}

const artworkItems: Omit<ArtworkItem, 'thumbnail' | 'mediumThumbnail'>[] = [
	{ id: 'little-lights-01', title: 'Little Lights · 01', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_01_little_lights.png', alt: 'A lamb rests beneath a flowering cherry tree above a sunlit mountain village; a Little Lights scripture reflection card.', scriptureReference: 'Psalm 23:1', featured: true, order: 1 },
	{ id: 'eternal-light-02', title: 'Eternal Light · 02', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_02_eternal_light.png', alt: 'A traveler carries a lantern through a snowy mountain village at dusk; an Eternal Light scripture reflection card.', scriptureReference: 'John 1:5', featured: true, order: 2 },
	{ id: 'little-lights-03', title: 'Little Lights · 03', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_03_little_lights.png', alt: 'A girl sits among wildflowers and looks toward the morning sun over distant hills; a Little Lights scripture reflection card.', scriptureReference: 'Matthew 11:28', featured: true, order: 3 },
	{ id: 'little-lights-04', title: 'Little Lights · 04', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_04_little_lights.png', alt: 'Cherry blossoms frame a quiet temple among distant mountains at sunrise; a Little Lights scripture reflection card.', scriptureReference: 'Lamentations 3:22–23', featured: false, order: 4 },
	{ id: 'little-lights-05', title: 'Little Lights · 05', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_05_little_lights.png', alt: 'A young lamb stands beside a stream in a green mountain meadow; a Little Lights scripture reflection card.', scriptureReference: 'Psalm 121:1–2', featured: false, order: 5 },
	{ id: 'little-lights-06', title: 'Little Lights · 06', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_06_little_lights.png', alt: 'A shepherd stands with lambs and looks across a wide mountain valley beneath a bright sky; a Little Lights scripture reflection card.', scriptureReference: 'Matthew 5:14', featured: false, order: 6 },
	{ id: 'eternal-light-07', title: 'Eternal Light · 07', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_07_eternal_light.png', alt: 'Sunbeams fall across a stone path and a small shrine in a deep green forest; an Eternal Light scripture reflection card.', scriptureReference: 'Psalm 46:1', featured: false, order: 7 },
	{ id: 'eternal-light-08', title: 'Eternal Light · 08', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_08_eternal_light.png', alt: 'A traveler stands on a high ridge facing a golden sunrise above layered mountains; an Eternal Light scripture reflection card.', scriptureReference: 'Isaiah 40:31', featured: false, order: 8 },
	{ id: 'eternal-light-09', title: 'Eternal Light · 09', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_09_eternal_light.png', alt: 'A snow-covered village glows with warm lights beneath a twilight sky; an Eternal Light scripture reflection card.', scriptureReference: 'Proverbs 3:5', featured: false, order: 9 },
	{ id: 'eternal-light-10', title: 'Eternal Light · 10', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_10_eternal_light.png', alt: 'A calm sea reflects the last light of sunset beneath a starry blue sky; an Eternal Light scripture reflection card.', scriptureReference: 'John 8:12', featured: false, order: 10 },
	{ id: 'eternal-light-11', title: 'Eternal Light · 11', collection: 'Eternal Light', image: '/images/scripture-cards/petalwake_scripture_card_11_eternal_light.png', alt: 'A warmly lit wooden home rests beneath trees on a quiet evening; an Eternal Light scripture reflection card.', scriptureReference: 'Romans 8:38–39', featured: false, order: 11 },
	{ id: 'little-lights-12', title: 'Little Lights · 12', collection: 'Little Lights', image: '/images/scripture-cards/petalwake_scripture_card_12_little_lights.png', alt: 'A paper lantern glows beside a garden path at twilight; a Little Lights scripture reflection card.', scriptureReference: 'Philippians 4:6', featured: false, order: 12 },
];

export const ARTWORK: ArtworkItem[] = artworkItems
	.map((item) => {
		const thumbnail = item.image.replace('/images/scripture-cards/', '/images/scripture-card-thumbnails/');
		return {
			...item,
			thumbnail: thumbnail.replace(/\.png$/, '-640.jpg'),
			mediumThumbnail: thumbnail.replace(/\.png$/, '-768.jpg'),
		};
	})
	.sort((a, b) => a.order - b.order);

export const FEATURED_ARTWORK = ARTWORK.filter((item) => item.featured).slice(0, 3);
