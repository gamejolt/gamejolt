import View from '!view!./video.html';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';
import { AppActivityFeedVideo } from '../../_video/video';

@View
@Component({
	components: {
		AppActivityFeedVideo,
	},
})
export class AppActivityFeedDevlogPostVideo extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get video() {
		return this.post.videos[0];
	}
}
