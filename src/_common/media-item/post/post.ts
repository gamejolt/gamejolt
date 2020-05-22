import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { AppImgResponsive } from '../../img/responsive/responsive';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../screen/screen-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppVideo from '../../video/video.vue';
import AppMediaItemBackdrop from '../backdrop/backdrop.vue';
import { MediaItem } from '../media-item-model';

@Component({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
		AppResponsiveDimensions,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppMediaItemPost extends Vue {
	@Prop(propRequired(MediaItem))
	mediaItem!: MediaItem;

	@Prop(propOptional(Boolean, true))
	isPostHydrated?: boolean;

	@Prop(propOptional(Boolean))
	isActive!: boolean;

	@Prop(propOptional(Boolean))
	restrictDeviceMaxHeight?: boolean;

	@Prop(propOptional(Boolean))
	inline?: boolean;

	isFilled = false;

	readonly Screen = Screen;

	@Emit('bootstrap')
	emitBootstrap() {}

	@Emit('fullscreen')
	emitFullscreen(_mediaItem: MediaItem) {}

	get shouldVideoPlay() {
		return this.isActive;
	}

	get itemRadius() {
		if (this.inline) {
			return this.isFilled ? undefined : 'lg';
		}

		return Screen.isXs && this.isFilled ? undefined : 'lg';
	}

	get itemStyling() {
		let style = {};

		if (!GJ_IS_SSR) {
			Object.assign(style, {
				maxWidth: this.mediaItem.width + 'px',
				maxHeight: this.mediaItem.height + 'px',
			});
		}

		return style;
	}

	get deviceMaxHeight() {
		if (GJ_IS_SSR || !this.restrictDeviceMaxHeight) {
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
