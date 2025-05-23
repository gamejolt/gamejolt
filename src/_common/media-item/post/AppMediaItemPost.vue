<script lang="ts" setup>
import { computed, CSSProperties, PropType, ref, toRefs, toValue } from 'vue';
import AppButton from '../../button/AppButton.vue';
import { useContentFocusService } from '../../content-focus/content-focus.service';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppResponsiveDimensions, {
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../screen/screen-service';
import AppStickerTarget from '../../sticker/target/AppStickerTarget.vue';
import {
	createStickerTargetController,
	useStickerTargetController,
} from '../../sticker/target/target-controller';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppVideo from '../../video/AppVideo.vue';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppMediaItemBackdrop from '../backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../media-item-model';

const props = defineProps({
	mediaItem: {
		type: Object as PropType<MediaItemModel>,
		required: true,
	},
	isPostHydrated: {
		type: Boolean,
		default: true,
	},
	isActive: {
		type: Boolean,
	},
	restrictDeviceMaxHeight: {
		type: Boolean,
	},
	inline: {
		type: Boolean,
	},
	canPlaceSticker: {
		type: Boolean,
	},
});

const emit = defineEmits({
	bootstrap: () => true,
	fullscreen: (_mediaItem: MediaItemModel) => true,
});

const { mediaItem, isActive, restrictDeviceMaxHeight, inline, canPlaceSticker } = toRefs(props);

const parentStickerTarget = useStickerTargetController();
const stickerTargetController = createStickerTargetController(mediaItem.value, {
	parent: () => toValue(parentStickerTarget),
	canReceiveCharge: () => stickerTargetController.parent.value?.canReceiveCharge.value === true,
});

const isFilled = ref(false);

const shouldShowFullscreenOption = computed(
	() =>
		restrictDeviceMaxHeight.value &&
		mediaItem.value.height >= 100 &&
		mediaItem.value.width >= 100
);

const stickersDisabled = computed(() => !isActive.value || !canPlaceSticker.value);

const shouldVideoPlay = computed(
	() => isActive.value && useContentFocusService().hasContentFocus.value
);

const videoController = computed(() => {
	const sources = {
		mp4: mediaItem.value.mediaserver_url_mp4,
		webm: mediaItem.value.mediaserver_url_webm,
	};
	return getVideoPlayerFromSources(sources, 'gif', mediaItem.value.mediaserver_url);
});

const itemRadius = computed(() => {
	if (inline.value) {
		return isFilled.value ? undefined : 'lg';
	}

	return Screen.isXs && isFilled.value ? undefined : 'lg';
});

const deviceMaxHeight = computed(() => {
	if (import.meta.env.SSR || !restrictDeviceMaxHeight.value) {
		return undefined;
	}

	// If the screen size is considered mobile, we want to treat
	// the mobile keyboard as if it doesn't exist. Using the
	// 'window.screen.height' will let us get the height of
	// the screen, rather than the viewport.
	if (Screen.isMobile) {
		return window.screen.height * 0.45;
	}
	return Screen.height * 0.45;
});

async function onDimensionsChange(e: AppResponsiveDimensionsChangeEvent) {
	emit('bootstrap');

	isFilled.value = e.isFilled;
}

function onClickImage() {
	// Inline means we are in a feed, and we use the fullscreen button to go fullscreen.
	// Clicking on the image in feed does nothing.
	// In the post view however, we don't show the button and instead a click anywhere on the image goes fullscreen.
	if (!inline.value) {
		emit('fullscreen', mediaItem.value);
	}
}

const itemStyling = import.meta.env.SSR
	? {}
	: ({
			maxWidth: mediaItem.value.width + 'px',
			maxHeight: mediaItem.value.height + 'px',
	  } as const satisfies CSSProperties);
</script>

<template>
	<div class="media-item-post" :class="{ _inline: inline }" @click="onClickImage">
		<AppResponsiveDimensions
			class="_media"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<div v-if="shouldShowFullscreenOption" class="_toolbar">
				<AppButton
					v-app-tooltip="$gettext(`Fullscreen`)"
					overlay
					circle
					trans
					icon="fullscreen"
					@click="emit('fullscreen', mediaItem)"
				/>
			</div>
			<AppMediaItemBackdrop class="_backdrop" :media-item="mediaItem" :radius="itemRadius">
				<AppStickerTarget
					class="_stickers"
					:controller="stickerTargetController"
					:disabled="stickersDisabled"
				>
					<AppImgResponsive
						v-if="!isPostHydrated || !mediaItem.is_animated"
						class="_img"
						:style="itemStyling"
						:src="mediaItem.mediaserver_url"
						alt=""
						ondragstart="return false"
					/>
					<AppVideo
						v-else-if="isActive && videoController"
						class="_video"
						:style="itemStyling"
						:player="videoController"
						:should-play="shouldVideoPlay"
						show-loading
					/>
				</AppStickerTarget>
			</AppMediaItemBackdrop>
		</AppResponsiveDimensions>
	</div>
</template>

<style lang="stylus" scoped>
._stickers
	width: 100%
	height: 100%

._video:after
	content: 'GIF'
	rounded-corners()
	position: absolute
	right: 8px
	bottom: 8px
	padding: 4px 6px
	background-color: rgba($black, 0.4)
	color: var(--dark-theme-fg)
	font-size: $font-size-small
	font-weight: bold
	transition: opacity 250ms $strong-ease-out

.media-item-post
	position: relative
	display: block
	vertical-align: middle
	width: 100%
	max-width: 100% !important

	&._inline
		display: inline-block

	&:not(._inline)
		._img
			cursor: zoom-in

	._media
		margin-left: auto
		margin-right: auto

	._backdrop
		change-bg('bg-offset')

	// Set the width to be what AppResponsiveDimensions gives us,
	// so we don't overflow past what it sets.
	._img
	._video
		width: 100%

	._toolbar
		position: absolute
		left: 0
		right: 0
		bottom: 12px
		display: flex
		align-items: center
		justify-content: center
		z-index: 6
		opacity: 0
		transition: opacity 0.2s ease

		@media (hover: none)
			display: none

	&:hover
		._toolbar
			opacity: 1

		@media $media-pointer-mouse
			._video:after
				opacity: 0
</style>
