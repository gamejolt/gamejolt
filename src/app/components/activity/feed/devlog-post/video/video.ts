import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html?style=./video.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
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
	@Prop(FiresidePost) post: FiresidePost;
	@Prop(Boolean) isHydrated?: boolean;

	contentBootstrapped = false;
	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	get video() {
		return this.post.videos[0];
	}

	async onDimensionsChange() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}

	play() {
		this.isShowingVideo = true;
		this.$emit('expanded');
	}
}
