import assert from 'node:assert/strict';
import test from 'node:test';
import { FEATURED_INSTAGRAM_POSTS, publicInstagramPosts, SOCIAL_LINKS, validSocialLinks } from '../src/data/socialLinks.ts';

test('Instagram spotlight starts with the verified studio profile and no invented post embeds', () => {
	assert.deepEqual(FEATURED_INSTAGRAM_POSTS, []);
	assert.equal(validSocialLinks().find((link) => link.platform === 'instagram')?.url, 'https://www.instagram.com/petalwakestudios/');
});

test('curated Instagram posts accept only secure post permalinks with local previews and cap at three', () => {
	const post = (id, permalink, previewImage = `/images/instagram/${id}.jpg`) => ({ id, permalink, previewImage, previewAlt: {} });
	const validPosts = [1, 2, 3, 4].map((number) => post(`${number}`, `https://www.instagram.com/p/abc${number}/`));
	const unsafePosts = [
		post('http', 'http://www.instagram.com/p/abc/'),
		post('foreign-host', 'https://instagram.example/p/abc/'),
		post('profile', 'https://www.instagram.com/petalwakestudios/'),
		post('external-image', 'https://example.com/preview.jpg'),
		post('protocol-relative', 'https://www.instagram.com/p/abc/', '//example.com/image.jpg'),
	];

	assert.equal(publicInstagramPosts([...validPosts, ...unsafePosts]).length, 3);
	assert.deepEqual(publicInstagramPosts(unsafePosts), []);
	assert.deepEqual(validSocialLinks(SOCIAL_LINKS).map((link) => link.platform), ['instagram', 'youtube']);
});
