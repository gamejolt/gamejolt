import { CommentVideo } from 'game-jolt-frontend-lib/components/comment/video/video-model';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
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

	canToggleContent = false;
	contentBootstrapped = false;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isOpen() {
		return this.feed.isItemOpen(this.item);
	}

	toggleFull() {
		this.feed.toggleItemOpen(this.item);
		this.$emit('expanded');
	}

	// We wait for the fade collapse component to bootstrap in and potentially
	// restrict the content size before saying we're bootstrapped.
	async canToggleChanged(canToggle: boolean) {
		this.canToggleContent = canToggle;

		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			// Wait for the fade to restrict content now before emitting the
			// event.
			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}
}
