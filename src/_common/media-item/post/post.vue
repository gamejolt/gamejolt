<script lang="ts">
import { computed, unref } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { useContentFocusService } from '../../content-focus/content-focus.service';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppResponsiveDimensions, {
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../screen/screen-service';
import AppStickerTarget from '../../sticker/target/AppStickerTarget.vue';
import {
	StickerTargetController,
	createStickerTargetController,
	useStickerTargetController,
} from '../../sticker/target/target-controller';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import AppVideo from '../../video/AppVideo.vue';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppMediaItemBackdrop from '../backdrop/AppMediaItemBackdrop.vue';
import { MediaItemModel } from '../media-item-model';

@Options({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
		AppResponsiveDimensions,
		AppStickerTarget,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppMediaItemPost extends Vue {
	@Prop({ type: Object, required: true }) mediaItem!: MediaItemModel;
	@Prop({ type: Boolean, default: true }) isPostHydrated!: boolean;
	@Prop({ type: Boolean, default: false }) isActive!: boolean;
	@Prop({ type: Boolean, default: false }) restrictDeviceMaxHeight!: boolean;
	@Prop({ type: Boolean, default: false }) inline!: boolean;
	@Prop({ type: Boolean, default: false }) canPlaceSticker!: boolean;

	parentStickerTarget = shallowSetup(() => useStickerTargetController());

	stickerTargetController!: StickerTargetController;

	isFilled = false;

	readonly Screen = Screen;

	@Emit('bootstrap') emitBootstrap() {}
	@Emit('fullscreen') emitFullscreen(_mediaItem: MediaItemModel) {}

	get shouldShowFullscreenOption() {
		return (
			this.restrictDeviceMaxHeight &&
			this.mediaItem.height >= 100 &&
			this.mediaItem.width >= 100
		);
	}

	get shouldVideoPlay() {
		return this.isActive && useContentFocusService().hasContentFocus.value;
	}

	get videoController() {
		const sources = {
			mp4: this.mediaItem.mediaserver_url_mp4,
			webm: this.mediaItem.mediaserver_url_webm,
		};
		return getVideoPlayerFromSources(sources, 'gif', this.mediaItem.mediaserver_url);
	}

	get itemRadius() {
		if (this.inline) {
			return this.isFilled ? undefined : 'lg';
		}

		return Screen.isXs && this.isFilled ? undefined : 'lg';
	}

	get itemStyling() {
		const style: any = {};

		if (!import.meta.env.SSR) {
			Object.assign(style, {
				maxWidth: this.mediaItem.width + 'px',
				maxHeight: this.mediaItem.height + 'px',
			});
		}

		return style;
	}

	get deviceMaxHeight() {
		if (import.meta.env.SSR || !this.restrictDeviceMaxHeight) {
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
	}

	get stickersDisabled() {
		return !this.isActive || !this.canPlaceSticker;
	}

	created() {
		this.stickerTargetController = createStickerTargetController(this.mediaItem, {
			parent: computed(() => unref(this.parentStickerTarget)),
			canReceiveCharge: computed(
				() => this.stickerTargetController.parent.value?.canChargeSticker.value === true
			),
		});
	}

	async onDimensionsChange(e: AppResponsiveDimensionsChangeEvent) {
		this.emitBootstrap();
		this.isFilled = e.isFilled;
	}

	onClickImage() {
		// In feed means we are inline, and we use the fullscreen button to go fullscreen.
		// Clicking on the image in feed does nothing.
		// In the post view however, we don't show the button and instead a click anywhere on the image goes fullscreen.
		if (!this.inline) {
			this.emitFullscreen(this.mediaItem);
		}
	}
}
</script>

<template>
	<div class="media-item-post" :class="{ '-inline': inline }" @click="onClickImage">
		<AppResponsiveDimensions
			class="-media"
			:class="{
				'-filled': isFilled,
			}"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<div v-if="shouldShowFullscreenOption" class="-toolbar">
				<AppButton
					v-app-tooltip="$gettext(`Fullscreen`)"
					overlay
					circle
					trans
					icon="fullscreen"
					@click="emitFullscreen(mediaItem)"
				/>
			</div>
			<AppMediaItemBackdrop class="-backdrop" :media-item="mediaItem" :radius="itemRadius">
				<AppStickerTarget
					class="-stickers"
					:controller="stickerTargetController"
					:disabled="stickersDisabled"
				>
					<AppImgResponsive
						v-if="!isPostHydrated || !mediaItem.is_animated"
						class="-img"
						:style="itemStyling"
						:src="mediaItem.mediaserver_url"
						alt=""
						ondragstart="return false"
					/>
					<AppVideo
						v-else-if="isActive && videoController"
						class="-video"
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
.-stickers
	width: 100%
	height: 100%

.-video
	&:after
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

	&.-inline
		display: inline-block

	&:not(.-inline)
		.-img
			cursor: zoom-in

	.-media
		margin-left: auto
		margin-right: auto

	.-backdrop
		change-bg('bg-offset')

	// Set the width to be what AppResponsiveDimensions gives us,
	// so we don't overflow past what it sets.
	.-img
	.-video
		width: 100%

	.-toolbar
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
		.-toolbar
			opacity: 1

		@media $media-pointer-mouse
			.-video:after
				opacity: 0
</style>
