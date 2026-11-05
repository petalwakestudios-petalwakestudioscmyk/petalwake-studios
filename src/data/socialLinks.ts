export type SocialPlatform = 'instagram' | 'youtube';

export interface SocialLink {
	platform: SocialPlatform;
	name: string;
	url: string;
	accessibleLabel: string;
	icon: SocialPlatform;
	enabled: boolean;
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
