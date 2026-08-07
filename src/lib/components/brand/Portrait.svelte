<script lang="ts">
	/**
	 * Abstract portrait placeholder. Brief §54, §108.
	 *
	 * "Use generated abstract portrait placeholders or local abstract artwork—not
	 * stolen photographs." Attaching a real person's photograph to a fictional
	 * profile would be considerably worse than the fictional profile alone, so
	 * these are authored compositions: concentric apertures whose geometry is
	 * derived from the index.
	 *
	 * Decorative — the name is adjacent in the DOM as real text, so the SVG adds
	 * nothing an assistive technology needs and is hidden rather than given a
	 * redundant label.
	 */
	interface Props {
		seed: number;
		/** Not rendered; used only to derive geometry deterministically. */
		name: string;
	}

	let { seed, name }: Props = $props();

	// Deterministic from the name, so a given person always gets the same
	// composition and server and client agree. Math.random() would break both.
	const hash = $derived(
		[...name].reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
	);

	const rings = $derived(
		Array.from({ length: 5 }, (_, index) => ({
			radius: 22 + index * 16,
			offset: ((hash + index * 37 + seed * 11) % 24) - 12,
			opacity: 0.5 - index * 0.07
		}))
	);
</script>

<svg
	class="portrait"
	viewBox="0 0 200 200"
	preserveAspectRatio="xMidYMid meet"
	aria-hidden="true"
	focusable="false"
>
	<rect class="field" width="200" height="200" />
	{#each rings as ring (ring.radius)}
		<circle
			class="ring"
			cx={100 + ring.offset}
			cy={100 - ring.offset * 0.6}
			r={ring.radius}
			opacity={ring.opacity}
		/>
	{/each}
	<line class="rule" x1="24" y1={100 + (hash % 30) - 15} x2="176" y2={100 + (hash % 30) - 15} />
</svg>

<style>
	.portrait {
		inline-size: 100%;
		/* Square intrinsic box: the team grid must not reflow when these paint. */
		aspect-ratio: 1;
		block-size: auto;
		border: var(--border-hairline) solid var(--border-subtle);
	}

	.field {
		fill: var(--surface-inset);
	}

	.ring {
		fill: none;
		stroke: var(--accent);
		stroke-width: 1;
	}

	.rule {
		stroke: var(--border-strong);
		stroke-width: 1;
	}
</style>
