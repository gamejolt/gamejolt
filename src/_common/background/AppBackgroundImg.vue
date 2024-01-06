<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRefs, watch, watchEffect } from 'vue';
import { PageScrollSubscriptionTimeout, usePageScrollSubscription } from '../scroll/scroll.service';
import { BackgroundModel, getBackgroundCSSProperties } from './background.model';

const props = defineProps({
	background: {
		type: Object as PropType<BackgroundModel>,
		required: true,
	},
	backgroundStyle: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
	scrollDirection: {
		type: String,
		default: undefined,
	},
	enablePageScroll: {
		type: Boolean,
	},
});

const { background, backgroundStyle, scrollDirection, enablePageScroll } = toRefs(props);

const root = ref<HTMLElement>();

const baseStyles = computed(() => {
	// We're casting this to CSSStyleDeclaration so that we can more easily
	// apply to the style property.
	return {
		...getBackgroundCSSProperties(background.value),
		...backgroundStyle?.value,
	} as CSSStyleDeclaration;
});

watchEffect(() => {
	if (!root.value) {
		return;
	}

	const _styles = baseStyles.value;
	for (const key in _styles) {
		// Don't assign backgroundPosition if we're currently modifying it
		// through page scroll offset.
		if (key === 'backgroundPosition' && pageScrollSubscription.isActive.value) {
			continue;
		}
		root.value.style[key] = _styles[key];
	}
});

function attachPageOffsetBackgroundStyles(top: number) {
	if (!root.value) {
		return;
	}
	if (!enablePageScroll.value || scrollDirection?.value) {
		root.value.style.backgroundPosition = baseStyles.value.backgroundPosition;
		root.value.style.transition = '';
	} else {
		root.value.style.backgroundPosition = `center ${top / 5}px`;
		root.value.style.transition = `background-position ${
			PageScrollSubscriptionTimeout + 20
		}ms ease-out`;
	}
}

const pageScrollSubscription = usePageScrollSubscription(attachPageOffsetBackgroundStyles, {
	enable: enablePageScroll.value,
});

watch(enablePageScroll, enabled => {
	if (enabled) {
		pageScrollSubscription.enable();
	} else {
		pageScrollSubscription.disable();
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
