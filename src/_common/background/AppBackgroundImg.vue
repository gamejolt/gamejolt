<script lang="ts" setup>
import { CSSProperties, PropType, ref, toRefs, watch } from 'vue';
import { styleAbsoluteFill } from '../../_styles/mixins';
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
	disablePageScroll: {
		type: Boolean,
	},
});

const { background, scrollDirection, backgroundStyle, disablePageScroll } = toRefs(props);

const root = ref<HTMLElement>();

// watchEffect(() => {
// 	if (!positionElem.value) {
// 		return;
// 	}
// 	const baseStyles = getBackgroundCSSProperties(background.value);
// 	for (const keyUnsafe in baseStyles) {
// 		const key = keyUnsafe as keyof typeof baseStyles;
// 		// Don't assign backgroundPosition if we're currently modifying it
// 		// through page scroll offset.
// 		if (key === 'backgroundPosition' && pageScrollSubscription.isActive.value) {
// 			continue;
// 		}
// 		positionElem.value.style[key] = baseStyles[key];
// 	}
// });

// We freeze the tile height for now since it shouldn't really change.
const tileHeight = background.value.media_item.croppedHeight / background.value.scale;
const baseStyles = watched(() => getBackgroundCSSProperties(background.value));

// let previousTop = 0;
// let previousTileIndex = 0;
function attachPageOffsetBackgroundStyles(top: number) {
	if (!root.value) {
		return;
	}

	// TODO: revert style
	if (disablePageScroll.value) {
		root.value.style.transform = `translateY(0)`;
		return;
	}

	// 	positionElem.value.style.backgroundPosition = getBackgroundCSSProperties(
	// 		background.value
	// 	).backgroundPosition;
	// 	positionElem.value.style.transition = '';
	// } else {

	// const tileIndex = Math.floor(top / tileHeight);
	top /= 5;
	top %= tileHeight;

	// if (tileIndex !== previousTileIndex) {
	// 	root.value.style.transition = '';
	// 	// Force a reflow so it animates again.
	// 	root.value.offsetWidth;

	// 	const positionDiff = top - previousTop;
	// 	root.value.style.transform = `translateY(${tileHeight + positionDiff}px)`;
	// 	console.log(top, previousTop, tileIndex, previousTileIndex, positionDiff);
	// 	// if (tileIndex > previousTileIndex) {
	// 	// } else if (tileIndex < previousTileIndex) {
	// 	// 	root.value.style.transform = `translateY(${tileHeight + positionDiff}px)`;
	// 	// }
	// }

	// root.value.style.transition = `transform ${PageScrollSubscriptionTimeout + 20}ms ease-out`;
	root.value.style.transform = `translateY(${top}px)`;

	// previousTop = top;
	// previousTileIndex = tileIndex;

	// transition: `transform ${PageScrollSubscriptionTimeout + 20}ms ease-out`,

	// positionElem.value.style.backgroundPosition = `center ${top / 5}px`;
	// positionElem.value.style.transition = `background-position ${
	// 	PageScrollSubscriptionTimeout + 20
	// }ms ease-out`;
	// }
}

// const baseStyles = ref(getBackgroundCSSProperties(background.value));
// watch(background, background => {
// 	baseStyles.value = getBackgroundCSSProperties(background);
// });

const pageScrollSubscription = usePageScrollSubscription(attachPageOffsetBackgroundStyles, {
	enable: !disablePageScroll.value,
});

watch(disablePageScroll, disablePageScroll => {
	if (disablePageScroll) {
		pageScrollSubscription.disable();
	} else {
		pageScrollSubscription.enable();
	}
});
</script>

<template>
	<div
		ref="root"
		:style="{
			...styleAbsoluteFill({ inset: `-${tileHeight}px` }),
		}"
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
