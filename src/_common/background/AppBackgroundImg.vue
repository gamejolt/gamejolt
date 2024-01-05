<script lang="ts" setup>
import { CSSProperties, PropType, ref, toRefs, watch } from 'vue';
import { styleAbsoluteFill, styleWhen } from '../../_styles/mixins';
import { watched } from '../reactivity-helpers';
import { usePageScrollSubscription } from '../scroll/scroll.service';
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
	backgroundStyle: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
	enablePageScroll: {
		type: Boolean,
	},
});

const { background, scrollDirection, backgroundStyle, enablePageScroll } = toRefs(props);

const root = ref<HTMLElement>();

// We freeze the tile height for now since it shouldn't really change.
const tileHeight = background.value.media_item.croppedHeight / background.value.scale;
const baseStyles = watched(() => getBackgroundCSSProperties(background.value));

function attachPageOffsetBackgroundStyles(top: number) {
	if (!root.value) {
		return;
	}

	if (!enablePageScroll.value) {
		root.value.style.transform = `translateY(0)`;
		return;
	}

	top /= 5;
	top %= tileHeight;

	root.value.style.transform = `translateY(${top}px)`;
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
		:style="
			styleWhen(pageScrollSubscription.isActive.value, {
				...styleAbsoluteFill({ inset: `-${tileHeight}px` }),
				// We change this a lot when we have the susbcription
				// active, so let the browser know.
				willChange: `transform`,
			})
		"
	>
		<div
			:class="scrollDirection ? ['_scroll', `_scroll-${scrollDirection}`] : []"
			:style="{
				...styleAbsoluteFill(),
				...baseStyles,
				...backgroundStyle,
			}"
		/>
	</div>
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
