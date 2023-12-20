<script lang="ts" setup>
import { CSSProperties, PropType, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { watched } from '../reactivity-helpers';
import { Scroll, usePageScrollSubscription } from '../scroll/scroll.service';
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
});

const { background } = toRefs(props);

const baseStyles = ref(getBackgroundCSSProperties(background.value));
const pageScrollSubscription = usePageScrollSubscription();

const linearToEaseOut = `cubic-bezier(0.35, 0.91, 0.33, 0.97)`;
const positionTransitionTime = Scroll.onScrollTimeout + 50;
const transitionStyles = {
	transition: `background-position ${positionTransitionTime}ms ${linearToEaseOut}`,
} satisfies CSSProperties;

watch(background, background => {
	baseStyles.value = getBackgroundCSSProperties(background);
});

const translateY = watched(() => {
	if (pageScrollSubscription) {
		return pageScrollSubscription.top.value / 5;
	}
	return 0;
});
</script>

<template>
	<div
		:class="{
			_scroll: scrollDirection,
			[`_scroll-${scrollDirection}`]: scrollDirection,
		}"
		:style="[
			baseStyles,
			styleWhen(translateY !== 0, {
				...transitionStyles,
				backgroundPosition: `center ${translateY}px`,
			}),
		]"
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
