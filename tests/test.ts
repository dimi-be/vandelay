import { execSync } from 'child_process';
import fs from "fs";
import path from "path";
import { assert } from "chai";

import { Builder } from '../src/builder';
import { JSDOM } from 'jsdom';

const basicTestFiles = path.resolve('tests/test-files/basic');
const tmpFolderPath = path.resolve('tmp');

function getPostTitle(el: Element): string {
    const h = el.getElementsByTagName('h3');
    return h.length != 1 ? undefined : h[0].childNodes[0].textContent.trim();
}

function getPostMeta(el: Element, className: string): string {
    const h = el.getElementsByClassName(className);
    return h.length != 1 ? undefined : h[0].childNodes[0].textContent.trim();
}

describe('integration: Builder', function() {
    this.beforeEach(function() {
        execSync(`rm -rf ${tmpFolderPath}`);
        fs.mkdirSync(tmpFolderPath);
    });

    describe('build', function() {
        it('should create index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const files = fs.readdirSync(tmpFolderPath);
            assert.include(files, 'index.html');
        });

        it('should build index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            assert.equal(document.title, 'Basic Test');
            assert.isDefined(document.getElementById('header'));
            assert.lengthOf(document.getElementById('header').childNodes, 1);
            assert.equal(document.getElementById('header').childNodes[0].textContent.trim(), 'Basic Test');
            assert.isDefined(document.getElementById('paragraph'));
            assert.lengthOf(document.getElementById('paragraph').childNodes, 1);
            assert.equal(document.getElementById('paragraph').childNodes[0].textContent.trim(), 'Basic content');
        });

        it('should add posts and pages to index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            const posts = document.querySelectorAll('#posts li');
            const pages = document.querySelectorAll('#pages li');

            assert.equal(posts.length, 2);
            assert.equal(getPostTitle(posts[0]), 'Post 1');
            assert.equal(getPostTitle(posts[1]), 'Post 2');
            assert.equal(pages.length, 2);
            assert.equal(pages[0].childNodes[0].textContent.trim(), 'About');
            assert.equal(pages[1].childNodes[0].textContent.trim(), 'Contact');
        });

        it('should add posts to posts/index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            const posts = document.querySelectorAll('#posts li');

            assert.equal(posts.length, 2);
            assert.equal(getPostTitle(posts[0]), 'Post 1');
            assert.equal(getPostTitle(posts[1]), 'Post 2');
        });

        it('should add posts meta data to index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            const posts = document.querySelectorAll('#posts li');
            const pages = document.querySelectorAll('#pages li');

            assert.equal(posts.length, 2);
            assert.equal(getPostTitle(posts[0]), 'Post 1');
            assert.equal(getPostMeta(posts[0], 'author'), 'Author: John Doe');
            assert.equal(getPostMeta(posts[0], 'description'), 'Description: Lorem ipsum dolor sit amet');
            assert.equal(getPostMeta(posts[0], 'created'), 'Created: 2021-10-26T15:15:00');
            assert.equal(getPostMeta(posts[0], 'modified'), 'Modified: 2021-10-26T18:00:00');
            assert.equal(getPostTitle(posts[1]), 'Post 2');
            assert.equal(getPostMeta(posts[1], 'author'), 'Author: John Doe');
            assert.equal(getPostMeta(posts[1], 'description'), 'Description: Consectetur adipiscing elit');
            assert.equal(getPostMeta(posts[1], 'created'), 'Created: 2021-11-02T22:45:00');
            assert.equal(getPostMeta(posts[1], 'modified'), 'Modified: 2021-11-03T09:00:00');
        });
    });

    
});
