import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./sketchfab.html?style=./sketchfab.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
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
	@Prop(FiresidePost) post: FiresidePost;
	@Prop(Boolean) isHydrated?: boolean;

	isShowing = GJ_IS_SSR;
	contentBootstrapped = false;

	get sketchfab() {
		return this.post.sketchfabs[0];
	}

	async onDimensionsChange() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('content-bootstrapped');
		}
	}

	play() {
		this.isShowing = true;
		this.$emit('expanded');
	}
}
