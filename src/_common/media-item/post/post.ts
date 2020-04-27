import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppEventItemMediaTags from '../../../app/components/event-item/media-tags/media-tags.vue';
import { propOptional, propRequired } from '../../../utils/vue';
import { AppImgResponsive } from '../../img/responsive/responsive';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../screen/screen-service';
import AppVideo from '../../video/video.vue';
import AppMediaItemBackdrop from '../backdrop/backdrop.vue';
import { MediaItem } from '../media-item-model';

@Component({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
		AppResponsiveDimensions,
		AppEventItemMediaTags,
	},
})
export default class AppMediaItemPost extends Vue {
	@Prop(propRequired(MediaItem))
	mediaItem!: MediaItem;

	@Prop(propOptional(Boolean))
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

	get shouldVideoPlay() {
		return this.isActive;
	}

	get itemRadius() {
		if (Screen.isXs && this.isFilled) {
			return;
		}

		return 'lg';
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
}
