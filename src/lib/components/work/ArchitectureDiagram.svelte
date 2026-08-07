<script lang="ts">
	/**
	 * Interactive system diagram for the Meridian fixture. Brief §102.
	 *
	 * The brief is explicit that essential information must not be WebGL-only, so
	 * this is DOM and SVG. The nodes are real <button> elements in a real tab
	 * order: hover and focus do the same thing, and keyboard traversal is the
	 * native one rather than a hand-rolled arrow-key handler that would have to
	 * reimplement focus management badly.
	 *
	 * The connecting lines are decorative — every relationship they express is
	 * also stated in the selected node's description, so a screen reader user
	 * loses nothing by not seeing them.
	 */
	interface Node {
		readonly id: string;
		readonly label: string;
		readonly description: string;
	}

	/**
	 * Typed as a non-empty tuple rather than `readonly Node[]`. Under
	 * `noUncheckedIndexedAccess` a plain array makes `NODES[0]` possibly
	 * undefined, which would force a null check on a list that is a literal in
	 * this file. The tuple type states the invariant instead of asserting it.
	 */
	const NODES: readonly [Node, ...Node[]] = [
		{
			id: 'market-data',
			label: 'Market Data',
			description:
				'Normalises several vendor feeds into one internal instrument model. Vendors disagree about identifiers, so reconciliation happens here rather than in every consumer downstream.'
		},
		{
			id: 'event-processing',
			label: 'Event Processing',
			description:
				'Turns a firehose of ticks into meaningful events. This is where volume becomes significance — a price change is data, a price change against a held position is an event.'
		},
		{
			id: 'application-state',
			label: 'Application State',
			description:
				'The authoritative session. Because state lives here rather than in the browser, a reconnect restores a workspace instead of reloading a page.'
		},
		{
			id: 'alert-engine',
			label: 'Alert Engine',
			description:
				'Decides what deserves interruption, on the server. Putting this decision in the interface is how dashboards end up showing everything and meaning nothing.'
		},
		{
			id: 'collaboration',
			label: 'Collaboration',
			description:
				'Annotations and shared context attached to instruments, not to screens, so a note survives someone else rearranging their workspace.'
		},
		{
			id: 'trading-workspace',
			label: 'Trading Workspace',
			description:
				'The surface a trader actually inhabits. It renders only what survived the alert engine, which is what keeps a continuous-use interface readable across a full session.'
		}
	];

	let selectedId = $state<string>(NODES[0].id);
	const selected = $derived(NODES.find((node) => node.id === selectedId) ?? NODES[0]);
</script>

<div class="diagram">
	<ol class="flow" role="list">
		{#each NODES as node, index (node.id)}
			<li>
				<button
					type="button"
					class="node"
					class:active={selectedId === node.id}
					aria-pressed={selectedId === node.id}
					aria-describedby="node-description"
					onclick={() => (selectedId = node.id)}
					onmouseenter={() => (selectedId = node.id)}
					onfocus={() => (selectedId = node.id)}
				>
					<span class="node-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
					<span class="node-label">{node.label}</span>
				</button>
			</li>
			{#if index < NODES.length - 1}
				<li class="connector" aria-hidden="true">
					<svg viewBox="0 0 40 8" preserveAspectRatio="none" focusable="false">
						<line x1="0" y1="4" x2="34" y2="4" vector-effect="non-scaling-stroke" />
						<polyline points="30,1 34,4 30,7" vector-effect="non-scaling-stroke" />
					</svg>
				</li>
			{/if}
		{/each}
	</ol>

	<!--
		A single live region rather than one per node. The description is the
		accessible companion to the visual highlight, so it is announced when the
		selection changes and referenced by aria-describedby from every node.
	-->
	<p class="description" id="node-description" aria-live="polite">
		<strong>{selected.label}.</strong>
		{selected.description}
	</p>
</div>

<style>
	.diagram {
		display: grid;
		gap: var(--space-lg);
		padding: var(--space-lg);
		border: var(--border-hairline) solid var(--border-subtle);
		background-color: var(--surface-secondary);
	}

	.flow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs);
		margin: 0;
		padding: 0;
	}

	.node {
		display: grid;
		gap: var(--space-3xs);
		padding-block: var(--space-2xs);
		padding-inline: var(--space-sm);
		text-align: start;

		border: var(--border-hairline) solid var(--border-subtle);
		background-color: var(--surface-primary);
		transition:
			border-color var(--dur-instant) var(--ease-exit),
			background-color var(--dur-instant) var(--ease-exit);
	}

	.node:hover,
	.node.active {
		border-color: var(--accent);
		transition-duration: var(--dur-fast);
		transition-timing-function: var(--ease-entrance);
	}

	.node.active {
		background-color: var(--surface-elevated);
	}

	.node-index {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-wide);
		color: var(--accent);
	}

	.node-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
		white-space: nowrap;
	}

	.connector {
		flex: none;
		inline-size: 40px;
	}

	.connector svg {
		inline-size: 100%;
		block-size: 8px;
		stroke: var(--border-strong);
		fill: none;
		stroke-width: 1;
	}

	.description {
		max-inline-size: 68ch;
		/* Reserves space for the longest description so switching nodes does not
		   reflow the section — the diagram is above the fold on this route. */
		min-block-size: 5lh;
		font-size: var(--text-sm);
		line-height: var(--lh-relaxed);
		color: var(--text-secondary);
	}

	.description strong {
		color: var(--text-primary);
	}
</style>
