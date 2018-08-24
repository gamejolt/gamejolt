import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./comment-video.html';

import { ActivityFeedItem } from '../item-service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppActivityFeedVideo } from '../_video/video';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';

@View
@Component({
	components: {
		AppActivityFeedVideo,
		AppFadeCollapse,
	},
})
export class AppActivityFeedCommentVideo extends Vue {
	@Prop(ActivityFeedItem) item!: ActivityFeedItem;
	@Prop(CommentVideo) video!: CommentVideo;
	@Prop(Boolean) isHydrated?: boolean;

	canToggleContent = false;
	contentBootstrapped = false;

	toggleFull() {
		this.item.isOpen = !this.item.isOpen;
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
