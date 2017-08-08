import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./comment-video.html';

import { ActivityFeedItem } from '../item-service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { AppActivityFeedVideo } from '../_video/video';

@View
@Component({
	components: {
		AppActivityFeedVideo,
	},
})
export class AppActivityFeedCommentVideo extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(Boolean) isHydrated?: boolean;

	get eventItem() {
		return this.item.feedItem as EventItem;
	}

	get video() {
		return this.eventItem.action as CommentVideo;
	}
}
