import { execSync } from 'child_process';
import fs from "fs";
import path from "path";
import { assert } from "chai";

import { Builder } from '../src/builder';
import { JSDOM } from 'jsdom';

const basicTestFiles = path.resolve('tests/test-files/basic');
const tmpFolderPath = path.resolve('tmp');

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

        it('should add posts to index.html', async function() {
            const builder = new Builder(basicTestFiles, tmpFolderPath);
            await builder.build();

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            const posts = document.querySelectorAll('#posts li');

            assert.equal(posts.length, 2);
            assert.equal(posts[0].childNodes[0].textContent.trim(), 'Post 1');
            assert.equal(posts[1].childNodes[0].textContent.trim(), 'Post 2');
        });
    });

    
});
