import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import AppVideoProcessingProgress from '../../../../../../_common/video/processing-progress/processing-progress.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoPlayer from '../../_video-player/video-player.vue';

@Component({
	components: {
		AppActivityFeedVideoPlayer,
		AppVideoProcessingProgress,
	},
})
export default class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	@Emit('query-param') emitQueryParam(_params: Record<string, string>) {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	onTimeChange(time: number) {
		this.emitQueryParam({ t: `${time}` });
	}

	onVideoPlay() {
		$viewPostVideo(this.video);
	}

	onProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
		}
	}
}
