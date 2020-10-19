import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { CommentVideo } from '../../../../../_common/comment/video/video-model';
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
		Analytics.trackEvent('activity-feed', 'comment-video-toggle-lead');
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
