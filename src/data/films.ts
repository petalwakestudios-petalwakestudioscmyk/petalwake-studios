export interface Film {
	title: string;
	slug: string;
	status?: 'available' | 'in-progress';
	logline: string;
	shortDescription: string;
	synopsis: string;
	aboutStory: string;
	themes: readonly { title: string; description: string }[];
	reflectionQuestion?: string;
	youtubeUrl: string;
	youtubeVideoId: string;
	heroImage: string;
	heroImageAlt: string;
	thumbnail: string;
	thumbnailAlt: string;
	imageWidth: number;
	imageHeight: number;
	gallery?: readonly { src: string; alt: string }[];
	visualLanguage: string;
	credits?: readonly { role: string; name: string }[];
	productionNote?: string;
	featured?: boolean;
	year?: string;
	type?: string;
}

export const FILMS = [
	{
		title: 'The Last Winter',
		slug: 'the-last-winter',
		status: 'available',
		type: 'Animated short film',
		logline:
			'On a snowy evening in rural Japan, an elderly woman visits the dying former husband who betrayed her decades earlier. As memories of wartime trauma and a marriage destroyed by betrayal return, the two confront the years between them. With his new wife quietly watching from the doorway, the woman offers him a final gift: forgiveness.',
		shortDescription:
			'After decades apart, a final visit brings a betrayed couple face to face with what cannot be undone—and with the possibility of forgiveness.',
		synopsis:
			'Winter has settled over rural Japan. An elderly woman visits the former husband from whom she has been separated for decades. As their conversation turns toward the past, memories return of wartime separation, trauma, betrayal, and the collapse of the life they once expected to share. His new wife watches quietly from the doorway.\n\nNearly half a century later, there is no way to recover what was lost. The man can no longer make the past right, and the woman cannot erase what happened. Their visit cannot restore the marriage or make the decades apart disappear. But they can decide what they will carry forward from it. The meeting brings no simple reconciliation, and neither person can step back into the life they once imagined. What happened remains part of their history, even as the woman considers how she wants to meet this final moment.\n\nBefore leaving, she offers him something neither expected to find after so many years: forgiveness. As winter begins to give way to spring, a small crocus emerges through the melting snow. It does not erase the grief of what came before. It suggests that possibility can still take root.',
		aboutStory:
			'The Last Winter asks what forgiveness can mean when the past cannot be repaired. An elderly woman returns to the dying former husband who betrayed her decades earlier. Their meeting brings the years between them into the room—not as a problem that can be solved, but as a history they must each face.\n\nThe man’s wartime trauma is part of that history. It helps us understand something of the fear and damage he carries, but understanding where harm came from does not make the harm disappear or remove his responsibility for it. A person may be shaped by what happened to them and still be accountable for what they do to someone else.\n\nForgiveness here is not a return to the marriage, a restoration of trust, or a claim that everything is well. The life they once expected cannot be recovered. The consequences remain. What changes is what the woman chooses to carry forward. Forgiveness does not undo the past. It changes what we carry forward from it.\n\nThe former husband’s new wife is not a rival for the past. Her quiet presence at the doorway makes room for compassion toward a history that is not her own. The film leaves viewers with questions rather than a formula: can resentment be released without denying what happened? What might compassion mean when reconciliation is no longer possible?',
		themes: [
			{
				title: 'Understanding and responsibility',
				description:
					'Trauma shapes the former husband’s history, but it does not excuse his betrayal. Compassion and accountability remain in view together.',
			},
			{
				title: 'Forgiveness without reunion',
				description:
					'Forgiveness does not restore the marriage or return the years they lost. The past remains visible, and its consequences remain real.',
			},
			{
				title: 'Hope that remembers',
				description:
					'A crocus rises as the snow begins to melt. It offers possibility, not erasure: life can begin again without pretending winter never came.',
			},
		],
		reflectionQuestion: 'Is forgiveness still meaningful when what was broken cannot be restored?',
		youtubeVideoId: 'jdS6HNKDxRI',
		youtubeUrl: 'https://www.youtube.com/watch?v=jdS6HNKDxRI',
		heroImage: '/images/the-last-winter-thumbnail.webp',
		heroImageAlt: 'A winter-lit scene from The Last Winter.',
		thumbnail: '/images/the-last-winter-thumbnail.webp',
		thumbnailAlt: 'A scene from The Last Winter, showing two characters in a winter-lit room.',
		imageWidth: 1280,
		imageHeight: 720,
		visualLanguage:
			'The Last Winter uses cinematic, anime-influenced visual storytelling, with painterly environments and naturalistic character proportions. Restrained facial animation and controlled movement leave room for pauses; deliberate compositions use negative space as part of the telling. Blue-gray winter tones sit against restrained amber interior light, gradually giving way to spring color. Hands, snow, windows, doorways, wedding rings, and flowers recur as quiet details in the frame. The crocus does not erase the winter. It grows through what remains of it. These choices keep attention on the distance between people as well as their expressions, letting a room, a threshold, or a small gesture carry part of the scene. The visual world stays composed and quiet, giving the film’s silences and changing seasons space to register.',
		credits: [{ role: 'Film', name: 'Petalwake Studios' }],
		productionNote:
			'Story conception, scene sequencing, creative direction, and scene selection and arrangement by the creator. Music generated with Suno and visual scenes generated with Google Flow; the creator assembled, edited, and mastered the film in iMovie.',
		featured: true,
	},
] as const satisfies readonly Film[];
