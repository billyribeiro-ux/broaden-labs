/**
 * Target of the bare `#lib` specifier declared in package.json `imports`.
 * Kit 3 replaced the `$lib` alias with this Node subpath-imports mechanism, and
 * `node_modules/$app/tsconfig.json` derives its `paths` from it.
 *
 * Deep imports (`#lib/components/...`) are the norm in this codebase; this
 * barrel exists so the bare specifier resolves rather than as a re-export hub.
 */

export {};
