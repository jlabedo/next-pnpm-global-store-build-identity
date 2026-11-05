import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const store = process.argv[2];
if (!['global', 'project'].includes(store)) throw new Error('Usage: node scripts/reproduce.mjs <global|project>');
const original = readFileSync('pnpm-workspace.yaml', 'utf8');
const run = (args) => {
  const child = spawnSync(args[0], args.slice(1), { stdio: 'inherit' });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`${args.join(' ')} failed (${child.status})`);
};
try {
  writeFileSync('pnpm-workspace.yaml', original.replace('virtualStoreType: global', `virtualStoreType: ${store}`));
  rmSync('node_modules', { recursive: true, force: true });
  rmSync('.next', { recursive: true, force: true });
  mkdirSync('results', { recursive: true });
  run(['pnpm', 'install', '--frozen-lockfile']);
  run(['pnpm', 'build']);
  run([process.execPath, 'scripts/snapshot.mjs', `results/${store}-node${process.versions.node.split('.')[0]}.json`]);
} finally {
  writeFileSync('pnpm-workspace.yaml', original);
}
