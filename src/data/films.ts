export interface Film {
	slug: string;
	title: string;
	logline: string;
	synopsis: string;
	aboutTheStory: string;
	thumbnail: string;
	thumbnailAlt: string;
	youtubeVideoId: string;
	youtubeUrl: string;
	thumbnailWidth: number;
	thumbnailHeight: number;
	featuredDescription: string;
	featured?: boolean;
	themes: readonly {
		title: string;
		description: string;
	}[];
	visualLanguage: string;
	datePublished?: string;
	duration?: string;
	credits?: readonly string[];
	keywords?: readonly string[];
}

export const FILMS = [
	{
		slug: 'the-last-winter',
		title: 'The Last Winter',
		logline:
			'On a snowy evening in rural Japan, an elderly woman visits the dying former husband who betrayed her decades earlier. As memories of wartime trauma and a marriage destroyed by betrayal return, the two confront the years between them. With his new wife quietly watching from the doorway, the woman offers him a final gift: forgiveness.',
		synopsis:
			'Winter has settled over rural Japan. An elderly woman visits the former husband from whom she has been separated for decades. As their conversation turns toward the past, memories return of wartime separation, trauma, betrayal, and the collapse of the life they once expected to share. His new wife watches quietly from the doorway.\n\nNearly half a century later, there is no way to recover what was lost. The man can no longer make the past right, and the woman cannot erase what happened. Their visit cannot restore the marriage or make the decades apart disappear. But they can decide what they will carry forward from it.\n\nBefore leaving, she offers him something neither expected to find after so many years: forgiveness. As winter begins to give way to spring, a small crocus emerges through the melting snow. It does not erase the grief of what came before. It suggests that possibility can still take root.',
		aboutTheStory:
			'The Last Winter begins with a question that has no easy answer: what can forgiveness mean when the past cannot be repaired? An elderly woman returns to the dying former husband who betrayed her decades earlier. Their meeting brings the years between them into the room—not as a problem that can be solved, but as a history they must each face.\n\nThe man’s wartime trauma is part of that history. It helps us see something of the fear and damage he carries, but understanding where harm came from does not make the harm disappear or remove his responsibility for it. The war is present through its human cost, not spectacle. A person may be shaped by what happened to them and still be accountable for what they do to someone else.\n\nForgiveness here is not a return to the marriage, a restoration of trust, or a claim that everything is well. The life they once expected cannot be recovered. The consequences remain. What changes is what the woman chooses to carry forward. Forgiveness does not undo the past. It changes what we carry forward from it.\n\nThe former husband’s new wife is not a rival for the past. Her quiet presence at the doorway offers another kind of attention: compassion for a person and a history that are not her own.\n\nThe story leaves room for viewers to sit with these choices. Is it possible to release resentment without denying what happened? What might compassion look like when reconciliation is no longer possible? The film does not offer a formula. It follows two people to the edge of a long winter and lets a small sign of spring remain.',
		thumbnail: '/images/the-last-winter-thumbnail.webp',
		thumbnailAlt: 'A scene from The Last Winter, showing two characters in a winter-lit room.',
		thumbnailWidth: 1280,
		thumbnailHeight: 720,
		youtubeVideoId: 'jdS6HNKDxRI',
		youtubeUrl: 'https://www.youtube.com/watch?v=jdS6HNKDxRI',
		featuredDescription:
			'A winter visit after decades apart brings a former couple face to face with betrayal, memory, and the possibility of forgiveness.',
		themes: [
			{
				title: 'Understanding and responsibility',
				description:
					'Trauma shapes the former husband’s history, but it does not excuse his betrayal. The story makes space for compassion without asking the woman to deny the harm.',
			},
			{
				title: 'Forgiveness without reunion',
				description:
					'Forgiveness does not restore the marriage or return the years they lost. It is a choice made with the past still visible and its consequences still real.',
			},
			{
				title: 'Hope that remembers',
				description:
					'A crocus rises as the snow begins to melt. It offers possibility, not erasure: life can begin again without pretending winter never came.',
			},
			{
				title: 'Compassion beyond the past',
				description:
					'The former husband’s new wife is not a rival. Her quiet presence at the doorway reflects a compassion that can make room for another person’s history.',
			},
		],
		visualLanguage:
			'The film uses a cinematic, hand-painted 2D anime-influenced approach, with painterly environments and restrained movement. Deliberate compositions leave room for silence; snow, windows, doorways, hands, rings, and flowers carry meaning without explaining every feeling. A blue-gray winter palette gradually gives way to restrained spring color. The crocus does not erase the winter. It grows through what remains of it.',
		featured: true,
	},
] as const satisfies readonly Film[];
