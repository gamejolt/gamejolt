import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { $viewCommentVideo, CommentVideo } from '../../../../../_common/comment/video/video-model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedVideoEmbed from '../_video-embed/video-embed.vue';

@Component({
	components: {
		AppActivityFeedVideoEmbed,
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppActivityFeedCommentVideo extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(CommentVideo)) video!: CommentVideo;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	canToggleContent = false;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isOpen() {
		return this.feed.isItemOpen(this.item);
	}

	toggleFull() {
		this.feed.toggleItemOpen(this.item);
		Analytics.trackEvent('activity-feed', 'comment-video-toggle-lead');
	}

	onPlay() {
		$viewCommentVideo(this.video);
	}

	async canToggleChanged(canToggle: boolean) {
		this.canToggleContent = canToggle;
	}
}
