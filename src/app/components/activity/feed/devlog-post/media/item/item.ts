import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import AppVideo from 'game-jolt-frontend-lib/components/video/video.vue'
import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import AppEventItemMediaTags from '../../../../../event-item/media-tags/media-tags.vue'
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

	@Emit('bootstrap')
	emitBootstrap() {}

	get shouldVideoPlay() {
		return this.isActive;
	}

	async onDimensionsChange(e: AppResponsiveDimensionsChangeEvent) {
		this.emitBootstrap();
		this.isFilled = e.isFilled;
	}
}
