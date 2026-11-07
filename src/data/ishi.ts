export type IshiLanguage = 'en' | 'ja';

export const ISHI_PAGE_COUNT = 13;
export const ISHI_PATH = '/featured-work/ishi/';
export const ISHI_READER_PATH = `${ISHI_PATH}read/`;

export const ishiPages: Record<IshiLanguage, string[]> = {
	en: Array.from({ length: ISHI_PAGE_COUNT }, (_, index) => `/manga/ishi/en/Slide${index + 1}.png`),
	ja: Array.from({ length: ISHI_PAGE_COUNT }, (_, index) => `/manga/ishi/ja/Slide${index + 1}ja.png`),
};

export function getIshiLanguage(value: string | null | undefined): IshiLanguage {
	return value === 'ja' ? 'ja' : 'en';
}

export function getIshiPage(value: string | null | undefined): number {
	if (!value || !/^\d+$/.test(value)) return 1;
	const page = Number(value);
	return Number.isSafeInteger(page) && page >= 1 && page <= ISHI_PAGE_COUNT ? page : 1;
}

export function ishiCover(language: IshiLanguage): string {
	return ishiPages[language][0];
}

export const ishiCopy = {
	en: {
		title: 'ISHI',
		japaneseTitle: '石',
		subtitle: 'Prologue 01: Silence',
		format: 'An original manga by Petalwake Studios',
		originalManga: 'Original Manga',
		availability: 'Available in English and Japanese',
		shortSynopsis: 'In a city built around connection, solitude has become something that can be measured, managed, and escaped. Ren moves quietly through a world where everyone seems to belong somewhere else, until a forgotten object behind a station wall responds to his presence.\n\nWhat begins as a small discovery suggests that the silence surrounding Ren may not be emptiness at all.',
		backstory: [
			'ISHI begins with a simple question: What happens when a society becomes so connected that being alone is treated as an abnormality?',
			'The story follows Ren through a city shaped by Musubi, a system that promises connection and an escape from isolation. While the people around him seem to move in perfect rhythm, Ren remains slightly outside that rhythm. A sound no one else notices leads him to a sealed maintenance hatch and a stone that appears ordinary, yet behaves as though it has been waiting for him.',
			'Prologue 01: Silence introduces the world of ISHI through observation, absence, and small disruptions. The story is intentionally restrained, allowing its mystery to emerge through imagery, repetition, and the spaces between words.',
		],
		contentNote: 'A quiet science-fiction mystery exploring isolation, memory, connection, and the unseen forces that draw people together.',
		credits: 'Created by Petalwake Studios',
		readNow: 'Read now',
		language: 'Language',
		synopsisHeading: 'Synopsis',
		backstoryHeading: 'The story behind ISHI',
		contentNoteHeading: 'Content note',
		readerPreview: 'A first look inside the story',
		share: 'Share ISHI',
		backToFeatured: 'Back to Featured Work',
		readAccessible: 'Read ISHI: Prologue 01, Silence',
		openReader: 'Open the reader',
		readerTitle: 'Read ISHI',
		readerInstructions: 'Use the arrow keys or buttons to move between pages. On a touch screen, swipe horizontally.',
		previous: 'Previous page',
		next: 'Next page',
		first: 'First page',
		last: 'Last page',
		shareReader: 'Share this page',
		focusMode: 'Focus reading mode',
		exitFocusMode: 'Exit focus reading mode',
		pageOf: 'of',
		loading: 'Loading manga page…',
		imageError: 'This manga page could not be loaded.',
		retry: 'Retry',
		shareMenu: 'Share options',
		copyLink: 'Copy link',
		copySuccess: 'Link copied',
		copyFailure: 'Could not copy the link. You can select and copy it from the address bar.',
		shareTitle: 'ISHI: Prologue 01, Silence',
		shareText: 'Read ISHI, an original manga from Petalwake Studios.',
		backToStory: 'Return to ISHI',
		shareUnavailable: 'Sharing is unavailable. Choose a sharing option below.',
	},
	ja: {
		title: 'ISHI',
		japaneseTitle: '石',
		subtitle: 'プロローグ01：静寂',
		format: 'Petalwake Studios オリジナルマンガ',
		originalManga: 'オリジナルマンガ',
		availability: '英語・日本語で公開中',
		shortSynopsis: 'つながることを中心に築かれた都市では、孤独さえも測られ、管理され、遠ざけられるものになっていた。\n\n誰もが自分の居場所へ向かう世界を、レンは静かに歩いている。だが駅の壁の奥で忘れ去られていた何かが、レンの存在に反応する。\n\n小さな発見をきっかけに、レンを取り巻く静寂が、決して空白ではなかったことが示されていく。',
		backstory: [
			'『ISHI 石』は、ひとつの問いから始まる。\n\nもし社会があまりにも深くつながり、ひとりでいることさえ異常と見なされるようになったら、何が起こるのか。',
			'物語の舞台は、孤独から人々を解放し、つながりを約束するシステム「ムスビ」によって形づくられた都市。周囲の人々が同じリズムで進んでいくように見える中、レンだけはその流れからわずかに外れている。\n\n誰にも聞こえない音に導かれ、レンは駅の壁に封じられた古い点検口へたどり着く。そこで見つけたのは、ごく普通に見えながら、まるでレンを待っていたかのように反応する一つの石だった。',
			'プロローグ01「静寂」は、視線、空白、反復、そして小さな異変を通して『ISHI 石』の世界を描き出す。言葉のあいだに残された静けさから、物語の謎が少しずつ姿を現していく。',
		],
		contentNote: '孤独、記憶、つながり、そして人を引き寄せる見えない力を描く、静かなSFミステリー。',
		credits: '制作：Petalwake Studios',
		readNow: '今すぐ読む',
		language: '言語',
		synopsisHeading: 'あらすじ',
		backstoryHeading: '『ISHI』について',
		contentNoteHeading: '内容について',
		readerPreview: '物語を少しだけご紹介',
		share: 'ISHIをシェア',
		backToFeatured: '注目作品に戻る',
		readAccessible: '『ISHI 石』プロローグ01「静寂」を読む',
		openReader: 'マンガを読む',
		readerTitle: 'ISHIを読む',
		readerInstructions: '矢印キーまたはボタンでページを移動できます。タッチ画面では左右にスワイプしてください。',
		previous: '前のページ',
		next: '次のページ',
		first: '最初のページ',
		last: '最後のページ',
		shareReader: 'このページをシェア',
		focusMode: '集中して読む',
		exitFocusMode: '集中モードを終了',
		pageOf: '／全',
		loading: 'マンガを読み込み中…',
		imageError: 'このページを読み込めませんでした。',
		retry: '再試行',
		shareMenu: 'シェア方法',
		copyLink: 'リンクをコピー',
		copySuccess: 'リンクをコピーしました',
		copyFailure: 'リンクをコピーできませんでした。アドレスバーからコピーしてください。',
		shareTitle: '『ISHI 石』プロローグ01「静寂」',
		shareText: 'Petalwake Studiosのオリジナルマンガ『ISHI 石』を読む。',
		backToStory: 'ISHIの作品紹介へ戻る',
		shareUnavailable: '共有機能を利用できません。以下の方法をお選びください。',
	},
} as const;
