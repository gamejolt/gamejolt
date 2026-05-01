<script lang="ts" setup>
import { onMounted, ref, useTemplateRef, watch } from 'vue';

import { Screen } from '~common/screen/screen-service';
import {
	getElementOffsetTopFromContext,
	getScrollTop,
	scrollTo,
} from '~common/scroll/scroll.service';
import { sleep } from '~utils/utils';

const ExtraCollapsePadding = 200;

/**
 * If the collapsed version would only leave this much pixels to expand it won't
 * collapse.
 */
const Threshold = 50;
type Props = {
	collapseHeight: number;
	isOpen?: boolean;
	animate?: boolean;
	size?: 'sm';
	ignoreThreshold?: boolean;
	asMask?: boolean;
};
const { collapseHeight, isOpen, animate, size, ignoreThreshold, asMask } = defineProps<Props>();

const emit = defineEmits<{
	requireChange: [isRequired: boolean];
	expand: [e: Event];
}>();
const isCollapsed = ref(false);
const frameRequestHandle = ref<number | undefined>();

let isRequired = false;
let isPrimed = false;

const root = useTemplateRef('root');

onMounted(async () => {
	// Let it compile DOM and wait for any images to be resized.
	await sleep(0);
	if (!root.value) {
		return;
	}

	// Take threshold into account only if our collapse height is big enough
	// for threshold to matter.
	const threshold = !ignoreThreshold && collapseHeight > Threshold * 2 ? Threshold : 0;

	if (collapseHeight && root.value.scrollHeight - threshold > collapseHeight) {
		isRequired = true;
	}

	emit('requireChange', isRequired);

	if (isRequired && !isOpen) {
		collapse();
	}
});

watch(
	() => isOpen,
	() => {
		if (!isRequired) {
			return;
		}

		if (isOpen) {
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
	root.value.style.maxHeight = collapseHeight + 'px';

	if (isPrimed) {
		// We will scroll to the bottom of the element minus some extra padding.
		// This keeps the element in view a bit.
		const targetTop =
			getElementOffsetTopFromContext(root.value) + collapseHeight - ExtraCollapsePadding;

		// Only if we're past where we would scroll.
		if (getScrollTop() > targetTop) {
			// If we're on a tiny screen, don't animate the scroll.
			// Just set it and move on.
			if (Screen.isXs || !animate) {
				scrollTo(targetTop, { animate: false });
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
		getElementOffsetTopFromContext(root.value) + root.value.offsetHeight - ExtraCollapsePadding;

	// Only scroll if we have to.
	// This will allow the element to collapse freely until our marker would go out of view.
	// Then we scroll.
	if (getScrollTop() > curPos) {
		scrollTo(curPos, { animate: false });
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
