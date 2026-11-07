import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { getIshiLanguage, getIshiPage, ISHI_PAGE_COUNT, ishiPages } from '../src/data/ishi.ts';

test('ISHI manifest includes the 13 original English and Japanese pages in order', () => {
	assert.equal(ISHI_PAGE_COUNT, 13);
	assert.equal(ishiPages.en.length, 13);
	assert.equal(ishiPages.ja.length, 13);
	for (let index = 0; index < ISHI_PAGE_COUNT; index += 1) {
		const page = index + 1;
		assert.equal(ishiPages.en[index], `/manga/ishi/en/Slide${page}.png`);
		assert.equal(ishiPages.ja[index], `/manga/ishi/ja/Slide${page}ja.png`);
		assert.ok(existsSync(`public${ishiPages.en[index]}`), `missing English page ${page}`);
		assert.ok(existsSync(`public${ishiPages.ja[index]}`), `missing Japanese page ${page}`);
	}
});

test('ISHI language and page query values resolve safely', () => {
	assert.equal(getIshiLanguage('ja'), 'ja');
	assert.equal(getIshiLanguage('en'), 'en');
	assert.equal(getIshiLanguage('fr'), 'en');
	assert.equal(getIshiLanguage(null), 'en');
	assert.equal(getIshiPage('1'), 1);
	assert.equal(getIshiPage('13'), 13);
	for (const invalid of [null, '', '0', '14', '-1', '2.5', '1x', '999999999999999999999']) {
		assert.equal(getIshiPage(invalid), 1, `expected ${String(invalid)} to resolve to page 1`);
	}
});
