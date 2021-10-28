import { execSync } from 'child_process';
import fs from "fs";
import path from "path";
import { assert } from "chai";

import { Builder } from '../src/builder';
import { JSDOM } from 'jsdom';

const tmpFolderPath = path.resolve('tmp');
const basicTestFiles = path.resolve('tests/test-files/basic');

describe('integration: Builder', function() {
    this.beforeEach(function() {
        execSync(`rm -rf ${tmpFolderPath}`);
        fs.mkdirSync(tmpFolderPath);
    });

    describe('build', function() {
        it('should create index.html', async function() {
            const builder = new Builder();
            await builder.build(basicTestFiles, tmpFolderPath);

            const files = fs.readdirSync(tmpFolderPath);
            assert.include(files, 'index.html');
        });

        it('should build index.html', async function() {
            const builder = new Builder();
            await builder.build(basicTestFiles, tmpFolderPath);

            const buffer = fs.readFileSync(path.join(tmpFolderPath, 'index.html'));
            const document = new JSDOM(buffer).window.document;

            assert.equal(document.title, 'Basic Test');
            assert.equal(document.getElementById('header').childNodes[0].textContent.trim(), 'Basic Test');
            assert.equal(document.getElementById('paragraph').childNodes[0].textContent.trim(), 'Basic content');
        });
    });
});
