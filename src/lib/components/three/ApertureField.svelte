<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		InstancedMesh,
		PlaneGeometry,
		ShaderMaterial,
		Matrix4,
		InstancedBufferAttribute,
		Color,
		DoubleSide
	} from 'three';
	import { allowsParallax, type Tier } from '#lib/three/capability.svelte';

	/**
	 * "The Aperture Field" — the hero scene. Brief §24, §74, §76.
	 *
	 * A constrained lattice of edge-lit rectangular plates on the SITE'S OWN
	 * 12×8 grid, unfolding from one flat plane into separated depth layers. Read
	 * as an architectural drawing set pulled apart into its sheets: the brand
	 * idea is constraint → expansion, and the geometry is literally the grid the
	 * rest of the page is built on gaining a third dimension.
	 *
	 * What it is deliberately NOT: particles, a glowing orb, a wireframe globe,
	 * or anything with a bloom pass. §24 rules out all four by name.
	 *
	 * Performance shape (§74):
	 *   - ONE PlaneGeometry (4 verts), ONE material, ONE InstancedMesh → 1 draw call
	 *   - no lights, no shadow map, no post-processing, no envmap
	 *   - render-on-demand: once the intro settles and the pointer rests, the GPU
	 *     goes fully idle. That is verifiable in DevTools, which is the point.
	 *
	 * Hydration safety (§76): every position is derived from the instance index.
	 * There is no randomness anywhere, so no seeded PRNG is needed and server and
	 * client cannot disagree.
	 */
	interface Props {
		tier: Tier;
		rows: number;
	}

	let { tier, rows }: Props = $props();

	const COLUMNS = 12;
	/** Grid pitch. */
	const SPACING = 0.5;
	/**
	 * Plate size, deliberately smaller than the pitch so the plates read as
	 * separate sheets with air between them. A 1-unit plate on a 0.42 pitch
	 * overlaps its neighbour by 2.4x and the field collapses into a plaid — which
	 * is what the first attempt looked like, and is exactly the "meaningless
	 * wireframe" §24 rules out.
	 */
	const PLATE_W = 0.36;
	const PLATE_H = 0.26;
	/** Distance between depth layers once the field has opened. */
	const LAYER_DEPTH = 0.62;

	const { invalidate } = useThrelte();

	/**
	 * Built once, imperatively, and held in $state.raw.
	 *
	 * `$state.raw` is not an optimisation here — it is required. Plain `$state`
	 * would wrap the three.js objects in reactive proxies, and three performs
	 * identity checks internally that a proxy breaks. The failure mode is silent.
	 */
	const geometry = new PlaneGeometry(PLATE_W, PLATE_H, 1, 1);

	const material = new ShaderMaterial({
		transparent: true,
		// No depth writes: the plates are translucent outlines that must blend with
		// each other rather than occlude. With depthWrite on, the draw order
		// decides which edges disappear, which looks like a bug.
		depthWrite: false,
		side: DoubleSide,
		uniforms: {
			uEdge: { value: 0.5 },
			uColor: { value: new Color('#78C5F2') },
			uOpacity: { value: 0 }
		},
		vertexShader: `
			attribute float aDepth;
			varying vec2 vUv;
			varying float vDepth;

			void main() {
				vUv = uv;
				vDepth = aDepth;
				// instanceMatrix is supplied automatically for an InstancedMesh, but a
				// CUSTOM ShaderMaterial must multiply by it explicitly — three only
				// injects that for its own materials.
				gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: `
			uniform float uEdge;
			uniform vec3 uColor;
			uniform float uOpacity;
			varying vec2 vUv;
			varying float vDepth;

			void main() {
				// Distance to the nearest edge of the unit quad.
				float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
				// fwidth gives a resolution-independent one-pixel feather, so the
				// outline stays exactly as crisp at 2x DPR as at 1x. This is what
				// makes it read as a drawing rather than 96 glowing rectangles.
				float w = fwidth(d) * 1.2;
				float edge = 1.0 - smoothstep(uEdge - w, uEdge + w, d);
				// Restraint (§74, §104): the field is a background, not the subject.
				// Nearer sheets read; distant ones are barely there.
				float fade = mix(0.62, 0.10, vDepth);
				gl_FragColor = vec4(uColor, edge * fade * uOpacity);
			}
		`
	});

	const count = $derived(COLUMNS * rows);

	/**
	 * The mesh is rebuilt when the row count changes (a tier change), and the
	 * previous one is disposed. Objects created by hand like this are NOT
	 * registered with Threlte's disposal refcount — that only covers things
	 * mounted through <T> — so disposal here is ours to do.
	 */
	let mesh = $state.raw<InstancedMesh | null>(null);

	$effect(() => {
		const instanced = new InstancedMesh(geometry, material, count);
		// frustumCulled off: the plates spread on Z during the intro, and a
		// bounding sphere computed at rest culls them mid-animation.
		instanced.frustumCulled = false;

		const matrix = new Matrix4();
		const depths = new Float32Array(count);

		for (let index = 0; index < count; index += 1) {
			const column = index % COLUMNS;
			const row = Math.floor(index / COLUMNS);
			const depth = rows > 1 ? row / (rows - 1) : 0;

			depths[index] = depth;
			// Z is the point: each row sits on its own sheet. The intro animates
			// mesh.scale.z from ~0 to 1, which collapses every layer onto one plane
			// and then pulls them apart — "constraint → expansion", literally.
			matrix.makeTranslation(
				(column - (COLUMNS - 1) / 2) * SPACING,
				((rows - 1) / 2 - row) * SPACING * 0.62,
				-row * LAYER_DEPTH
			);
			instanced.setMatrixAt(index, matrix);
		}

		geometry.setAttribute('aDepth', new InstancedBufferAttribute(depths, 1));
		instanced.instanceMatrix.needsUpdate = true;
		mesh = instanced;
		invalidate();

		return () => {
			instanced.dispose();
			mesh = null;
		};
	});

	/* ── Choreography ─────────────────────────────────────────────────────────
	 * Mapped to §25's timeline. Written into plain (non-reactive) variables and
	 * pushed onto uniforms inside the task, because a $state write per frame
	 * would schedule a Svelte update 60 times a second for values only the GPU
	 * reads.
	 */
	let elapsed = 0;
	let pointerX = 0;
	let pointerY = 0;
	let targetX = 0;
	let targetY = 0;

	// `still` skips the intro entirely and renders the settled composition —
	// reduced motion means arriving, not travelling.
	const animated = $derived(tier !== 'still');

	function onPointerMove(event: PointerEvent) {
		if (!allowsParallax(tier)) return;
		targetX = (event.clientX / window.innerWidth - 0.5) * 2;
		targetY = (event.clientY / window.innerHeight - 0.5) * 2;
		invalidate();
	}

	useTask(
		(delta) => {
			const uniforms = material.uniforms;
			if (!uniforms.uEdge || !uniforms.uOpacity) return;

			if (!animated) {
				// The settled composition, arrived at rather than travelled to.
				uniforms.uEdge.value = 0.018;
				uniforms.uOpacity.value = 1;
				if (mesh) mesh.scale.set(1, 1, 1);
				return;
			}

			elapsed += delta;

			// 0.00 closed → 0.35 plates open → 1.20 field settled. Clamped rather
			// than eased by a library so the scene owns no timeline of its own to
			// leak.
			const open = Math.min(elapsed / 0.9, 1);
			const eased = 1 - Math.pow(1 - open, 4);

			// uEdge 0.5 is a filled quad (no outline visible); 0.018 is a hairline.
			// The plates therefore OPEN rather than fade in.
			uniforms.uEdge.value = 0.5 - eased * 0.482;
			uniforms.uOpacity.value = Math.min(elapsed / 0.45, 1);

			if (mesh) {
				// THE unfold: every layer starts collapsed onto one plane and the
				// sheets separate along Z as the field opens.
				mesh.scale.set(1, 1, 0.02 + eased * 0.98);

				// Inertial pointer follow. Lerped rather than assigned so the camera
				// never snaps, and capped small — §73/§104 both warn against motion
				// that fights the user.
				pointerX += (targetX - pointerX) * Math.min(delta * 3, 1);
				pointerY += (targetY - pointerY) * Math.min(delta * 3, 1);
				mesh.rotation.y = pointerX * 0.05;
				mesh.rotation.x = pointerY * 0.03;
			}

			// Keep requesting frames only while something is still changing.
			if (open < 1 || Math.abs(targetX - pointerX) > 0.001) invalidate();
		},
		{
			/**
			 * autoInvalidate defaults to TRUE, which silently forces a render every
			 * frame and defeats render-on-demand entirely — the single most common
			 * way an "on-demand" Threlte scene ends up pinning a GPU. This task
			 * invalidates deliberately, only while something is moving.
			 */
			autoInvalidate: false
		}
	);
</script>

<svelte:window onpointermove={onPointerMove} />

<!--
	fov 32, not the tutorial default of 75. A long lens is near-orthographic and
	keeps the plates reading as a drawing; 75 fish-eyes the outer columns and
	makes the grid look like a tunnel. The 2° roll stops it reading as a
	screenshot of a spreadsheet.
-->
<T.PerspectiveCamera
	makeDefault
	fov={32}
	near={0.1}
	far={40}
	position={[0.9, -0.35, 5.6]}
	rotation={[0, 0, 0.035]}
/>

{#if mesh}
	<T is={mesh} />
{/if}
