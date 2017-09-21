import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedItem } from '../../item-service';
import { AppActivityFeedVideo } from '../../_video/video';

@View
@Component({
	components: {
		AppActivityFeedVideo,
	},
})
export class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(FiresidePost) post: FiresidePost;
	@Prop(Boolean) isHydrated?: boolean;

	get video() {
		return this.post.videos[0];
	}
}
