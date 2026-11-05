import { execFileSync } from 'node:child_process';
import path from 'node:path';
export default {
  generateBuildId: async () => 'fixed-build',
  experimental: {
    turbopackAdditionalRoots: {
      pnpm: { path: path.join(execFileSync('pnpm', ['store', 'path'], { encoding: 'utf8' }).trim(), 'links') },
    },
  },
};
