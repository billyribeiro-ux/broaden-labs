import type { Plugin } from 'vite';

/**
 * Fails a production build while fictional client proof is still enabled.
 * Brief §13, §55, §120.
 *
 * Runs in `buildStart`, so it aborts before any bundling work happens and the
 * failure is the first thing in the log rather than the last.
 *
 * The gate is deliberately asymmetric:
 *   - development / preview  → demo content is expected; the count is logged.
 *   - production             → any demo credential record is a hard error,
 *                              unless BROADEN_CONTENT_READY=1 is set explicitly.
 *
 * The escape hatch exists because at some point real case studies will replace
 * the fixtures one at a time, and the team needs to be able to ship before the
 * last one is converted. It has to be typed out deliberately, which is the point.
 */
export function contentSafety(): Plugin {
	return {
		name: 'broaden:content-safety',

		async buildStart() {
			// Vite's own `mode` is not consulted here: `vite build` is `production`
			// mode for a preview deployment too, and a preview SHOULD show demo
			// content. The deployment target is its own signal.
			const target = process.env.PUBLIC_SITE_ENV ?? 'development';
			const acknowledged = process.env.BROADEN_CONTENT_READY === '1';

			// Imported dynamically so the registry is evaluated at build time, in
			// Node, without pulling app code into the plugin's module graph.
			const { demoCredentialRecords, contentRegistrySize } = await import('../content/index.ts');

			const demo = demoCredentialRecords();
			const total = contentRegistrySize();

			if (target !== 'production' || acknowledged) {
				const suffix =
					acknowledged && demo.length > 0 ? ' (BROADEN_CONTENT_READY=1 acknowledged)' : '';
				this.info(
					`[content-safety] target=${target}: ${demo.length} demo credential record(s) permitted of ${total} total${suffix}.`
				);
				return;
			}

			if (demo.length === 0) return;

			const byKind = new Map<string, string[]>();
			for (const record of demo) {
				const ids = byKind.get(record.kind) ?? [];
				ids.push(record.id);
				byKind.set(record.kind, ids);
			}

			const listing = [...byKind.entries()]
				.map(([kind, ids]) => `  ${kind} (${ids.length}): ${ids.join(', ')}`)
				.join('\n');

			this.error(
				`[content-safety] Refusing to build for production.\n\n` +
					`${demo.length} record(s) are still marked isDemo:true and would ship as ` +
					`factual client proof:\n\n${listing}\n\n` +
					`Replace them with real, verified content, or set BROADEN_CONTENT_READY=1 to ` +
					`state deliberately that shipping them is intended.`
			);
		}
	};
}
