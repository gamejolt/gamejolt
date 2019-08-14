import { AppImgResponsive } from '../../../../../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../../../../../_common/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppVideo from '../../../../../../../_common/video/video.vue';
import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
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
