import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';
import AppActivityFeedVideo from '../../_video/video.vue';

@Component({
	components: {
		AppActivityFeedVideo,
	},
})
export default class AppActivityFeedDevlogPostVideo extends Vue {
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
