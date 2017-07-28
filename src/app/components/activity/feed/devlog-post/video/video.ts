import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html?style=./video.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../../lib/gj-lib-client/components/fireside/post/video/video-model';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppVideoEmbed } from '../../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { ActivityFeedItem } from '../../item-service';

@View
@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;

	post: FiresidePost = null as any;
	video: FiresidePostVideo | null = null;
	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	created() {
		this.post = this.item.feedItem as FiresidePost;
		this.video = this.post.videos[0];
	}

	mounted() {
		this.$emit('content-bootstrapped');
	}

	play() {
		this.isShowingVideo = true;
		this.$emit('expanded');
	}
}
