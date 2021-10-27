import { execSync } from 'child_process';
import { mkdirSync, readdirSync } from "fs";
import { resolve } from "path";
import { assert } from "chai";

import { Builder } from '../src/builder';

const tmpFolderPath = resolve('tmp');
const basicTestFiles = resolve('tests/test-files/basic/posts');

describe('integration: Builder', function() {
    this.beforeEach(function() {
        execSync(`rm -rf ${tmpFolderPath}`);
        mkdirSync(tmpFolderPath);
    });

    describe('build', function() {
        it('should create index.html', async function() {
            const builder = new Builder();
            await builder.build(basicTestFiles, tmpFolderPath);

            const files = readdirSync(tmpFolderPath);
            assert.include(files, 'index.html');
        });
    });
});
