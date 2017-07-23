import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./sketchfab.html?style=./sketchfab.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostSketchfab } from '../../../../../../lib/gj-lib-client/components/fireside/post/sketchfab/sketchfab-model';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppSketchfabEmbed } from '../../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { ActivityFeedItem } from '../../item-service';

@View
@Component({
	components: {
		AppJolticon,
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostSketchfab extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;

	post: FiresidePost = null as any;
	sketchfab: FiresidePostSketchfab | null = null;
	isShowing = GJ_IS_SSR;

	created() {
		this.post = this.item.feedItem as FiresidePost;
		this.sketchfab = this.post.sketchfabs[0];
	}

	play() {
		this.isShowing = true;
		this.$emit('expanded');
	}
}
