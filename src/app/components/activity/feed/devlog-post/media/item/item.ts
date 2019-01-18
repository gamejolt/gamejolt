import View from '!view!./item.html?style=./item.styl';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from 'game-jolt-frontend-lib/components/responsive-dimensions/responsive-dimensions';
import { AppVideo } from 'game-jolt-frontend-lib/components/video/video';
import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { AppEventItemMediaTags } from '../../../../../event-item/media-tags/media-tags';
import { ActivityFeedView } from '../../../view';

@View
@Component({
	components: {
		AppImgResponsive,
		AppVideo,
		AppResponsiveDimensions,
		AppEventItemMediaTags,
	},
})
export class AppActivityFeedDevlogPostMediaItem extends Vue {
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
