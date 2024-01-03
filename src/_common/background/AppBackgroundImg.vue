<script lang="ts" setup>
import { PropType, ref, toRefs, watch, watchEffect } from 'vue';
import { pageScrollSubscriptionTimeout, usePageScrollSubscription } from '../scroll/scroll.service';
import { BackgroundModel, getBackgroundCSSProperties } from './background.model';

const props = defineProps({
	background: {
		type: Object as PropType<BackgroundModel>,
		required: true,
	},
	scrollDirection: {
		type: String,
		default: undefined,
	},
	disablePageScroll: {
		type: Boolean,
	},
});

const { background, scrollDirection, disablePageScroll } = toRefs(props);

const root = ref<HTMLElement>();

watchEffect(() => {
	if (!root.value) {
		return;
	}
	const baseStyles = getBackgroundCSSProperties(background.value);
	for (const keyUnsafe in baseStyles) {
		const key = keyUnsafe as keyof typeof baseStyles;
		// Don't assign backgroundPosition if we're currently modifying it
		// through page scroll offset.
		if (
			key === 'backgroundPosition' &&
			pageScrollSubscription.isActive &&
			!pageScrollSubscription.isDisposed
		) {
			continue;
		}
		root.value.style[key] = baseStyles[key];
	}
});

function attachPageOffsetBackgroundStyles(top: number) {
	if (!root.value) {
		return;
	}
	if (disablePageScroll.value || scrollDirection?.value) {
		root.value.style.backgroundPosition = getBackgroundCSSProperties(
			background.value
		).backgroundPosition;
		root.value.style.transition = '';
	} else {
		root.value.style.backgroundPosition = `center ${top / 5}px`;
		root.value.style.transition = `background-position ${
			pageScrollSubscriptionTimeout + 20
		}ms ease-out`;
	}
}

const pageScrollSubscription = usePageScrollSubscription(attachPageOffsetBackgroundStyles, {
	active: !disablePageScroll.value,
});

watch(disablePageScroll, disablePageScroll => {
	if (disablePageScroll) {
		pageScrollSubscription.deactivate();
	} else {
		pageScrollSubscription.activate();
	}
});
</script>

<template>
	<div
		ref="root"
		:class="{
			_scroll: scrollDirection,
			[`_scroll-${scrollDirection}`]: scrollDirection,
		}"
	/>
</template>

<style lang="stylus" scoped>
._scroll
	animation-timing-function: linear !important
	animation-duration: 20s
	animation-iteration-count: infinite

._scroll-left
._scroll-right
	animation-name: anim-scroll-h

._scroll-up
._scroll-down
	animation-name: anim-scroll-v

._scroll-left
._scroll-down
	animation-direction: reverse

@keyframes anim-scroll-h
	0%
		background-position: 0 0
	100%
		background-position: 800px 0

@keyframes anim-scroll-v
	0%
		background-position: 0 0
	100%
		background-position: 0 -800px
</style>
