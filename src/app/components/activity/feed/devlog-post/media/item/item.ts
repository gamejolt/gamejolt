import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
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

	readonly Screen = Screen;

	@Emit('bootstrap')
	emitBootstrap() {}

	get shouldVideoPlay() {
		return this.isActive;
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
	}
}
