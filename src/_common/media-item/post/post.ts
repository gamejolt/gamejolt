import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import { AppImgResponsive } from '../../img/responsive/responsive';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../screen/screen-service';
import {
	StickerTargetController,
	StickerTargetParentControllerKey,
} from '../../sticker/target/target-controller';
import AppStickerTarget from '../../sticker/target/target.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppVideo from '../../video/video.vue';
import AppMediaItemBackdrop from '../backdrop/backdrop.vue';
import { MediaItem } from '../media-item-model';

@Options({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
		AppResponsiveDimensions,
		AppStickerTarget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppMediaItemPost extends Vue {
	@Prop({ type: Object, required: true }) mediaItem!: MediaItem;
	@Prop(propOptional(Boolean, true)) isPostHydrated!: boolean;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) restrictDeviceMaxHeight!: boolean;
	@Prop(propOptional(Boolean, false)) inline!: boolean;
	@Prop(propOptional(Boolean, false)) canPlaceSticker!: boolean;

	@Inject({ from: StickerTargetParentControllerKey })
	parentStickerTarget!: StickerTargetController;

	isFilled = false;

	stickerTargetController!: StickerTargetController;

	readonly Screen = Screen;

	@Emit('bootstrap') emitBootstrap() {}
	@Emit('fullscreen') emitFullscreen(_mediaItem: MediaItem) {}

	get shouldShowFullscreenOption() {
		return (
			this.restrictDeviceMaxHeight &&
			this.mediaItem.height >= 100 &&
			this.mediaItem.width >= 100
		);
	}

	get shouldVideoPlay() {
		return this.isActive && ContentFocus.hasFocus;
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
			return;
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

	async onDimensionsChange(e: AppResponsiveDimensionsChangeEvent) {
		this.emitBootstrap();
		this.isFilled = e.isFilled;
	}

	created() {
		// We pass the parent sticker target controller in as the parent for this
		// one. This will link them up so that when the parent is showing, we also
		// try showing stickers on this target.
		this.stickerTargetController = new StickerTargetController(
			this.mediaItem,
			this.parentStickerTarget
		);
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
