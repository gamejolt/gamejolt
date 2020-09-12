import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { CommentVideo } from '../../../../../_common/comment/video/video-model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedView } from '../view';
import AppActivityFeedVideo from '../_video/video.vue';

@Component({
	components: {
		AppActivityFeedVideo,
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppActivityFeedCommentVideo extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(CommentVideo)
	video!: CommentVideo;

	contentBootstrapped = false;

	@Emit('expanded') emitExpanded() {}
	@Emit('content-bootstrapped') emitContentBootstrapped() {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	// We wait for the fade collapse component to bootstrap in and potentially
	// restrict the content size before saying we're bootstrapped.
	async bootstrapFadeCollapse() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			// Wait for the fade to restrict content now before emitting the
			// event.
			await this.$nextTick();
			this.emitContentBootstrapped();
		}
	}
}
