export type SocialPlatform = 'instagram' | 'youtube';

export interface SocialLink {
	platform: SocialPlatform;
	name: string;
	url: string;
	accessibleLabel: string;
	icon: SocialPlatform;
	enabled: boolean;
}

export interface FeaturedInstagramPost {
	id: string;
	permalink: string;
	previewImage: string;
	previewAlt: Partial<Record<'en' | 'ja', string>>;
}

// Add up to three verified public post permalinks with matching local previews.
// This stays empty until post URLs and preview artwork are intentionally curated.
export const FEATURED_INSTAGRAM_POSTS: FeaturedInstagramPost[] = [];

export function publicInstagramPosts(posts = FEATURED_INSTAGRAM_POSTS): FeaturedInstagramPost[] {
	return posts.filter((post) => {
		if (!post.id || !post.previewImage.startsWith('/images/') || post.previewImage.startsWith('//')) return false;
		try {
			const url = new URL(post.permalink);
			return url.protocol === 'https:'
				&& ['instagram.com', 'www.instagram.com'].includes(url.hostname)
				&& /^\/(p|reel)\/[\w-]+\/?$/.test(url.pathname);
		} catch {
			return false;
		}
	}).slice(0, 3);
}

export const SOCIAL_LINKS: SocialLink[] = [
	{
		platform: 'instagram',
		name: 'Instagram',
		url: 'https://www.instagram.com/petalwakestudios/',
		accessibleLabel: 'Petalwake Studios on Instagram',
		icon: 'instagram',
		enabled: true,
	},
	{
		platform: 'youtube',
		name: 'YouTube',
		url: 'https://www.youtube.com/@PetalwakeStudios',
		accessibleLabel: 'Petalwake Studios on YouTube',
		icon: 'youtube',
		enabled: true,
	},
];

export function validSocialLinks(links: SocialLink[] = SOCIAL_LINKS): SocialLink[] {
	return links.filter((link) => {
		if (!link.enabled) return false;
		try {
			const url = new URL(link.url);
			return url.protocol === 'https:' && Boolean(url.hostname);
		} catch {
			return false;
		}
	});
}
