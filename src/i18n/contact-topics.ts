import type { ContactTopic } from '../lib/contact-contract';

export const contactTopicLabels: Record<'en' | 'ja', Record<ContactTopic, string>> = {
	en: {
		general: 'General inquiry',
		ministry: 'Ministry and Christian faith',
		japan: 'Japan and Japanese-language inquiries',
		media: 'Films, media, press, and licensing',
		collaboration: 'Collaboration and partnerships',
		other: 'Other',
	},
	ja: {
		general: '一般的なお問い合わせ',
		ministry: 'キリスト教やイエスに従うことについて',
		japan: '日本語でのご相談',
		media: '映像作品・メディア・取材・ライセンス',
		collaboration: '協働・パートナーシップ',
		other: 'その他',
	},
};
