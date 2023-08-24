<script lang="ts" setup>
import { computed, PropType, ref, Ref, toRefs } from 'vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { createLightbox } from '../../../../../_common/lightbox/lightbox-helpers';
import AppMediaItemPost from '../../../../../_common/media-item/post/post.vue';
import AppEventItemMediaIndicator from '../../../../../_common/pagination/AppPageIndicator.vue';
import { kThemeBgActual } from '../../../../../_common/theme/variables';
import AppTouch, { AppTouchInput } from '../../../../../_common/touch/AppTouch.vue';
import { styleBorderRadiusLg, styleElevate, styleWhen } from '../../../../../_styles/mixins';
import { ActivityFeedItem } from '../item-service';
import { useActivityFeed } from '../view';

const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
	canPlaceSticker: {
		type: Boolean,
	},
});

const { item, post, canPlaceSticker } = toRefs(props);

const feed = useActivityFeed()!;

const root = ref() as Ref<HTMLElement>;
const slider = ref() as Ref<HTMLElement>;

const page = ref(1);
const isDragging = ref(false);

const lightbox = createLightbox(computed(() => post.value.media));
const isHydrated = computed(() => feed.isItemHydrated(item.value));

function goNext() {
	if (page.value >= post.value.media.length) {
		_updateSliderOffset();
		return;
	}

	page.value = Math.min(page.value + 1, post.value.media.length);
	_updateSliderOffset();
	Analytics.trackEvent('activity-feed', 'media-next');
}

function goPrev() {
	if (page.value <= 1) {
		_updateSliderOffset();
		return;
	}

	page.value = Math.max(page.value - 1, 1);
	_updateSliderOffset();
	Analytics.trackEvent('activity-feed', 'media-prev');
}

async function onItemBootstrapped() {
	_updateSliderOffset();
}

function _updateSliderOffset(extraOffsetPx = 0) {
	const pagePercent = page.value - 1;
	const pagePx = slider.value.offsetWidth * -pagePercent;
	slider.value.style.transform = `translate3d( ${pagePx + extraOffsetPx}px, 0, 0 )`;
}

function panStart() {
	isDragging.value = true;
}

function pan(event: AppTouchInput) {
	// In case the animation frame was retrieved after we stopped dragging.
	if (!isDragging.value) {
		return;
	}

	_updateSliderOffset(event.deltaX);
}

function panEnd(event: AppTouchInput) {
	isDragging.value = false;

	// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
	const { velocityX, deltaX, distance } = event;

	if (
		// Check if it was a fast flick,
		(Math.abs(velocityX) > 0.55 && distance > 10) ||
		// or if the pan distance was at least ~1/3 of the content area.
		Math.abs(deltaX) >= root.value.clientWidth / 3
	) {
		if (velocityX > 0 || deltaX > 0) {
			goPrev();
		} else {
			goNext();
		}
		return;
	}

	_updateSliderOffset();
}

function onClickFullscreen() {
	lightbox.show(page.value - 1);
	Analytics.trackEvent('activity-feed', 'media-fullscreen');
}
</script>

<template>
	<div ref="root" class="post-media">
		<AppTouch
			class="-lightbox"
			:pan-options="{ direction: 'horizontal' }"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
		>
			<div class="-container">
				<div ref="slider" class="-slider">
					<AppMediaItemPost
						v-for="(mediaItem, index) of post.media"
						:key="mediaItem.id"
						:media-item="mediaItem"
						:is-post-hydrated="isHydrated"
						:is-active="index === page - 1"
						:can-place-sticker="canPlaceSticker"
						restrict-device-max-height
						inline
						@bootstrap="onItemBootstrapped()"
						@fullscreen="onClickFullscreen"
					/>
				</div>
			</div>

			<template v-if="post.media.length > 1">
				<div class="-prev" :class="{ '-hide': page === 1 }" @click.stop="goPrev">
					<AppJolticon icon="chevron-left" />
				</div>

				<div
					class="-next"
					:class="{ '-hide': page === post.media.length }"
					@click.stop="goNext"
				>
					<AppJolticon icon="chevron-right" />
				</div>
			</template>
		</AppTouch>

		<AppEventItemMediaIndicator
			v-if="post.media.length > 1"
			class="-indicator"
			:inner-styles="
				styleWhen(post.hasBackground && post.hasAnyMedia, {
					...styleBorderRadiusLg,
					...styleElevate(1),
					backgroundColor: kThemeBgActual,
					padding: `4px 6px`,
				})
			"
			:count="post.media.length"
			:current="page"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

$-button-size = 60px

.post-media
	margin-top: $-item-padding-xs-v
	position: relative

	@media $media-sm-up
		margin-top: $-item-padding-v

	&:hover
		.-next
		.-prev
			visibility: visible
			opacity: 1

.-container
	display: block
	overflow: hidden
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-slider
	white-space: nowrap
	transition: transform 300ms $strong-ease-out

.-hide
	opacity: 0 !important
	transition: none !important

.-prev
.-next
	position: absolute
	top: 'calc(50% - (%s / 2))' % $-button-size
	display: flex
	align-items: center
	justify-content: center
	width: $-button-size
	height: @width
	background-color: rgba($black, 0.65)
	visibility: hidden
	opacity: 0
	z-index: 2
	transition: opacity 0.2s ease, visibility 0.2s

	// Hide and disable slider controls for mobile devices
	@media screen and (pointer: coarse)
		display: none

	> .jolticon
		color: var(--dark-theme-fg)
		font-size: ($-button-size / 2)

	&:hover
		background-color: var(--theme-bi-bg)

		> .jolticon
			color: var(--theme-bi-fg)

.-prev
	left: -($-item-padding-container)
	border-top-right-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

.-next
	right: -($-item-padding-container)
	border-top-left-radius: $border-radius-large
	border-bottom-left-radius: $border-radius-large

.-indicator
	margin-top: 10px
</style>
