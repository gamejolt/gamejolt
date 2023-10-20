<script lang="ts" setup>
import { onMounted, PropType, ref, toRefs, watch } from 'vue';
import { sleep } from '../utils/utils';
import { Screen } from './screen/screen-service';
import { Scroll } from './scroll/scroll.service';

const ExtraCollapsePadding = 200;

/**
 * If the collapsed version would only leave this much pixels to expand it won't
 * collapse.
 */
const Threshold = 50;
const props = defineProps({
	collapseHeight: {
		type: Number,
		required: true,
	},
	isOpen: {
		type: Boolean,
	},
	animate: {
		type: Boolean,
	},
	size: {
		type: String as PropType<'sm'>,
		default: undefined,
		validator: val => !val || val === 'sm',
	},
	ignoreThreshold: {
		type: Boolean,
	},
	asMask: {
		type: Boolean,
	},
});

const emit = defineEmits({
	requireChange: (_isRequired: boolean) => true,
	expand: (_e: Event) => true,
});

const { collapseHeight, isOpen, animate, size, ignoreThreshold, asMask } = toRefs(props);
const isCollapsed = ref(false);
const frameRequestHandle = ref<number | undefined>();

let isRequired = false;
let isPrimed = false;

const root = ref<HTMLDivElement>();

onMounted(async () => {
	// Let it compile DOM and wait for any images to be resized.
	await sleep(0);
	if (!root.value) {
		return;
	}

	// Take threshold into account only if our collapse height is big enough
	// for threshold to matter.
	const threshold =
		!ignoreThreshold.value && collapseHeight.value > Threshold * 2 ? Threshold : 0;

	if (collapseHeight.value && root.value.scrollHeight - threshold > collapseHeight.value) {
		isRequired = true;
	}

	emit('requireChange', isRequired);

	if (isRequired && !isOpen.value) {
		collapse();
	}
});

watch(
	() => isOpen.value,
	() => {
		if (!isRequired) {
			return;
		}

		if (isOpen.value) {
			expand();
		} else {
			collapse();
		}

		isPrimed = true;
	}
);

/**
 * Called when the fade at the bottom is clicked on. We want to open it up in that case so that
 * they can actually click on what's below.
 */
function fadeClick(e: Event) {
	emit('expand', e);
}

function expand() {
	if (!root.value) {
		return;
	}
	isCollapsed.value = false;
	root.value.style.maxHeight = root.value.scrollHeight + 'px';
}

function collapse() {
	if (!root.value) {
		return;
	}
	isCollapsed.value = true;
	root.value.style.maxHeight = collapseHeight.value + 'px';

	if (isPrimed) {
		// We will scroll to the bottom of the element minus some extra padding.
		// This keeps the element in view a bit.
		const scrollTo =
			Scroll.getElementOffsetTopFromContext(root.value) +
			collapseHeight.value -
			ExtraCollapsePadding;

		// Only if we're past where we would scroll.
		if (Scroll.getScrollTop() > scrollTo) {
			// If we're on a tiny screen, don't animate the scroll.
			// Just set it and move on.
			if (Screen.isXs || !animate.value) {
				Scroll.to(scrollTo, { animate: false });
			} else {
				// Otherwise set up a scroll animation to follow the bottom of the element as it collapses.
				setupScrollAnim();
			}
		}
	}
}

function setupScrollAnim() {
	// Start the loop.
	frameRequestHandle.value = window.requestAnimationFrame(() => animStep());
}

function animStep() {
	if (!root.value) {
		return;
	}

	// Bottom of element from the scroll context top.
	// We then subtract some padding so that they still see some of the element while scrolling.
	const curPos =
		Scroll.getElementOffsetTopFromContext(root.value) +
		root.value.offsetHeight -
		ExtraCollapsePadding;

	// Only scroll if we have to.
	// This will allow the element to collapse freely until our marker would go out of view.
	// Then we scroll.
	if (Scroll.getScrollTop() > curPos) {
		Scroll.to(curPos, { animate: false });
	}

	// Request another frame to loop again.
	frameRequestHandle.value = window.requestAnimationFrame(() => animStep());
}

// This gets called after any of our maxHeight transitions.
function afterTransition() {
	// If we are doing the collapse scroll animation, then we can stop the
	// animation handler.
	if (frameRequestHandle.value) {
		window.cancelAnimationFrame(frameRequestHandle.value);
		frameRequestHandle.value = undefined;
	}
}
</script>

<template>
	<div
		ref="root"
		class="fade-collapse"
		:class="{
			'-sm': size === 'sm',
			'-animate': animate,
			'fade-collapse-collapsed': isCollapsed,
			'-fade-mask': isCollapsed && asMask,
		}"
		@transitionend="afterTransition"
	>
		<div class="-fade" :class="{ '-fade-color': !asMask }" @click="fadeClick($event)" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.fade-collapse
	position: relative
	overflow: hidden
	--fade-height: 100px

	&.-sm
		--fade-height: 30px

	@media $media-sm-up
		&.-animate
			transition: max-height 600ms $strong-ease-out

.-fade
	position: absolute
	display: none
	bottom: 0
	left: 0
	right: 0
	height: var(--fade-height)
	z-index: 1

	// We need this full name since it's targeted in other components to change the styling.
	.fade-collapse-collapsed &
		display: block

.-fade-color
	background-image: linear-gradient(to bottom, var(--theme-bg-actual-trans) 0, var(--theme-bg-actual) 100%)

.-fade-mask
	mask-image: linear-gradient(to top, transparent 0, black var(--fade-height), black 100%)
</style>
