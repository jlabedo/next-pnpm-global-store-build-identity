import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const [a, b] = process.argv.slice(2).map(file => JSON.parse(readFileSync(file, 'utf8')));
assert.equal(a.lockfileSha256, b.lockfileSha256, 'Different lockfiles');
assert.equal(a.next, b.next, 'Different Next.js versions');
assert.equal(a.buildId, b.buildId, 'Different BUILD_IDs');
assert.deepEqual(a.bootstrap, b.bootstrap, 'Same sources and lockfile, different client bootstrap');
console.log('Same client bootstrap');
