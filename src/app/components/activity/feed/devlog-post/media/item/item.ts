import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import AppImgBackdrop from '../../../../../../../_common/img/backdrop/backdrop.vue';
import { AppImgResponsive } from '../../../../../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../../../../../_common/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppVideo from '../../../../../../../_common/video/video.vue';
import AppEventItemMediaTags from '../../../../../event-item/media-tags/media-tags.vue';
import { ActivityFeedView } from '../../../view';

@Component({
	components: {
		AppImgResponsive,
		AppImgBackdrop,
		AppVideo,
		AppResponsiveDimensions,
		AppEventItemMediaTags,
	},
})
export default class AppActivityFeedDevlogPostMediaItem extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(MediaItem)
	mediaItem!: MediaItem;

	@Prop(Boolean)
	isPostHydrated!: boolean;

	@Prop(Boolean)
	isActive!: boolean;

	isFilled = false;
	scaledWidth = 0;
	scaledHeight = 0;

	readonly Screen = Screen;

	@Emit('bootstrap')
	emitBootstrap() {}

	get shouldVideoPlay() {
		return this.isActive;
	}

	get width() {
		return this.scaledWidth + 'px';
	}

	get height() {
		return this.scaledHeight + 'px';
	}

	get itemStyling() {
		let style = {};

		if (!GJ_IS_SSR) {
			Object.assign(style, {
				maxWidth: this.mediaItem.width + 'px',
				maxHeight: this.mediaItem.height + 'px',
			});
		}

		if (this.width && this.height) {
			Object.assign(style, {
				width: this.width,
				height: this.height,
			});
		}

		return style;
	}

	get deviceMaxHeight() {
		if (GJ_IS_SSR) {
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

		this.scaledWidth = e.containerWidth;
		this.scaledHeight = e.height;
	}
}
