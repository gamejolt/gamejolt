<script lang="ts" setup>
import { nextTick, onMounted, ref, toRefs, watch } from 'vue';
import { useResizeObserver } from '../../utils/resize-observer.js';
import { debounce } from '../../utils/utils.js';

const props = defineProps({
	density: {
		type: Number,
		default: 1,
	},
	colors: {
		type: Array as () => string[],
		default: () => ['gold', 'orangered', 'dodgerblue'],
	},
	animationSpeed: {
		type: Number,
		default: 1,
	},
});

const { density, colors, animationSpeed } = toRefs(props);

const effects = ref<HTMLDivElement>();

useResizeObserver({
	target: effects,
	callback: () => {
		resetEffects();
	},
});

onMounted(async () => {
	if (!effects.value) {
		return;
	}

	resetEffects();
});

watch([density, colors, animationSpeed], () => resetEffects());

const animations = ref<Animation[]>([]);
const particles = ref<HTMLDivElement[]>([]);

const resetEffects = debounce(_resetEffects, 500);

async function _resetEffects() {
	if (!effects.value) {
		return;
	}

	// animations.value.forEach(anim => anim.finish());
	particles.value.forEach(child => effects.value?.removeChild(child));
	// await sleep(1000);
	await nextTick();

	const numParticles = Math.round((effects.value.clientWidth / 5.5) * density.value);
	for (let i = 0; i < numParticles; i++) {
		const width = Math.random() * 10;
		const height = width * 0.4;
		const elem = document.createElement('div');
		elem.style.width = width + 'px';
		elem.style.height = height + 'px';
		elem.style.top = '-150px';
		elem.style.left = Math.random() * 100 + '%';
		elem.style.opacity = (Math.random() + 0.5).toString();
		elem.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
		elem.style.position = 'absolute';
		elem.style.backgroundColor = colors.value[Math.floor(Math.random() * colors.value.length)];

		effects.value.appendChild(elem);
		particles.value.push(elem);
		drop(elem);
	}
}

async function drop(elem: HTMLDivElement) {
	await nextTick();
	const animation = elem.animate(
		[
			// Keyframes, TS doesn't like this for some reason, but it works
			{ top: '-150px', transform: 'rotate(0)' },
			{
				top: '100%',
				transform: 'rotate(' + (-1000 + Math.random() * 2000) + 'deg)',
			},
		],
		{
			duration: (Math.random() * 2000 + 2000) / animationSpeed.value,
			iterations: Infinity,
		}
	);
	animation.currentTime = (Math.random() * 2000 + 2000) / animationSpeed.value;

	animations.value.push(animation);
}
</script>

<template>
	<div ref="effects" class="-effect-container" />
</template>

<style lang="stylus" scoped>
.-effect-container
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	overflow: hidden
	pointer-events: none
	*
		pointer-events: none
</style>
