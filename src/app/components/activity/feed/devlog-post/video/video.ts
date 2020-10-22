import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import { AppResponsiveDimensions } from '../../../../../../_common/responsive-dimensions/responsive-dimensions';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoEmbed from '../../_video-embed/video-embed.vue';
import AppActivityFeedVideoPlayer from '../../_video-player/video-player.vue';

@Component({
	components: {
		AppActivityFeedVideoPlayer,
		AppActivityFeedVideoEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	@Emit('content-bootstrapped') emitContentBootstrapped() {}
	@Emit('click-video-player') emitClickVideoPlayer(_event: MouseEvent, _timestamp: number) {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isFocused() {
		return this.feed.isItemFocused(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	onVideoPlay() {
		$viewPostVideo(this.video);
	}
}
