import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./comment-video.html';

import { ActivityFeedItem } from '../item-service';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { AppActivityFeedVideo } from '../_video/video';

@View
@Component({
	components: {
		AppActivityFeedVideo,
	},
})
export class AppActivityFeedCommentVideo extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(CommentVideo) video: CommentVideo;
	@Prop(Boolean) isHydrated?: boolean;
}
