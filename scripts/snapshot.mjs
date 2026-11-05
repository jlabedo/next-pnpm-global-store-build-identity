import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));
const manifest = json('.next/build-manifest.json');
const next = realpathSync('node_modules/next');
const marker = `${path.sep}links${path.sep}`;
const result = {
  node: process.version,
  platform: process.platform,
  architecture: process.arch,
  next: json('node_modules/next/package.json').version,
  lockfileSha256: createHash('sha256').update(readFileSync('pnpm-lock.yaml')).digest('hex'),
  buildId: readFileSync('.next/BUILD_ID', 'utf8').trim(),
  nextStorePath: next.includes(marker) ? next.split(marker)[1] : 'project',
  bootstrap: manifest.pagesChunkGroupBootstrapParams['/page'],
};
const output = JSON.stringify(result, null, 2) + '\n';
if (process.argv[2]) writeFileSync(process.argv[2], output);
console.log(output);
