# Turbopack client identities with pnpm's global virtual store

Minimal reproduction of client module/chunk identities changing between Node.js majors with the same application sources, lockfile, and fixed Next.js `BUILD_ID`.

No Turborepo, OpenNext, remote cache, custom cache handler, or dependency relocation is used. Both builds succeed. The app is a single client counter component.

## Reproduce

Requirements: pnpm 12.16.1, Node 24.21.0 and 26.13.0 (select them using your preferred version manager).

Each reproduction command removes **this fixture's** `node_modules` and `.next`, installs from the frozen lockfile, builds, and saves a JSON report. The workspace configuration is restored afterward.

Under Node 24.21.0:

```sh
node scripts/reproduce.mjs global
node scripts/reproduce.mjs project
```

Switch to Node 26.13.0, then repeat:

```sh
node scripts/reproduce.mjs global
node scripts/reproduce.mjs project
```

Compare:

```sh
# Fails: client bootstrap differs despite matching lockfile and BUILD_ID.
node scripts/compare.mjs results/global-node24.json results/global-node26.json

# Passes: same client bootstrap with the project-local virtual store.
node scripts/compare.mjs results/project-node24.json results/project-node26.json
```

## Observed results

macOS arm64, pnpm 12.16.1, React/React DOM 19.3.1, Next.js **16.5.0-canary.41**. Exact reports are committed in `observations/`.

| Store | Node | `/page` bootstrap module ID |
| --- | --- | --- |
| global | 24.21.0 | 12433 |
| global | 26.13.0 | 67487 |
| project | 24.21.0 | 73074 |
| project | 26.13.0 | 73074 |

The three bootstrap chunk filenames also change with the global store. All four builds use `BUILD_ID=fixed-build` and the same lockfile SHA-256.

Also observed with Next.js 16.4.3: global-store bootstrap IDs 12912 (Node 24) and 53428 (Node 26).

## Mechanism and scope

The documented `experimental.turbopackAdditionalRoots` is configured with the stable root name `pnpm`. It resolves dependencies successfully and removes the absolute machine-specific store prefix from module identities. The graph-hash segment **inside** that root remains in the module identity.

pnpm includes `<platform>-<arch>-node<major>` in its global-store hash when a package transitively requires a build. Next.js depends on Sharp, so its store path changes with the Node major. Pure-JS subgraphs can retain their paths.

- [Next.js additional roots documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#additional-roots-experimental)
- [Next.js generateBuildId documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/generateBuildId)
- [pnpm 12.16.1 graph-hash implementation](https://github.com/pnpm/pnpm/blob/v12.16.1/pnpm/crates/graph-hasher/src/global_virtual_store_path.rs#L27-L35)

This reproduction isolates the build-identity difference. It does **not** claim either build fails by itself, or reproduce a complete caching integration. Reusing prerendered HTML from one compilation with another compilation's JavaScript can be incompatible despite a matching custom `BUILD_ID`. Whether cross-engine reproducibility should be supported, or documented as unsupported, needs maintainer guidance.

## Related reports checked

- [#93556](https://github.com/vercel/next.js/issues/93556): dependency resolution outside the root; this fixture resolves and builds successfully.
- [#99157](https://github.com/vercel/next.js/issues/99157): CSS handling with additional roots; this fixture has no CSS.
- [#63201](https://github.com/vercel/next.js/issues/63201): older non-deterministic CSS builds; this fixture changes the Node engine with a global-store/project-store control.

Prepared with AI assistance; observations were obtained by running the builds and comparisons.
