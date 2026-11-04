import type { ContactTopic } from '../lib/contact-contract';

export const PRIVATE_EMAIL_ADDRESSES = {
	hello: 'hello@petalwakestudios.com',
	ministry: 'ministry@petalwakestudios.com',
	japan: 'japan@petalwakestudios.com',
	contact: 'contact@petalwakestudios.com',
	info: 'info@petalwakestudios.com',
	media: 'media@petalwakestudios.com',
} as const;

export const CONTACT_ROUTING: Record<ContactTopic, { label: string; recipient: string }> = {
	general: { label: 'General inquiry', recipient: PRIVATE_EMAIL_ADDRESSES.hello },
	ministry: { label: 'Ministry and Christian faith', recipient: PRIVATE_EMAIL_ADDRESSES.ministry },
	japan: { label: 'Japan and Japanese-language inquiries', recipient: PRIVATE_EMAIL_ADDRESSES.japan },
	media: { label: 'Films, media, press, and licensing', recipient: PRIVATE_EMAIL_ADDRESSES.media },
	collaboration: { label: 'Collaboration and partnerships', recipient: PRIVATE_EMAIL_ADDRESSES.contact },
	other: { label: 'Other', recipient: PRIVATE_EMAIL_ADDRESSES.contact },
};

export function getContactDestination(topic: string) {
	return Object.hasOwn(CONTACT_ROUTING, topic)
		? CONTACT_ROUTING[topic as ContactTopic].recipient
		: undefined;
}
