import View from '!view!./sketchfab.html?style=./sketchfab.styl';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { AppSketchfabEmbed } from '../../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

@View
@Component({
	components: {
		AppJolticon,
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostSketchfab extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	@Prop(FiresidePost)
	post!: FiresidePost;

	isShowing = GJ_IS_SSR;
	contentBootstrapped = false;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

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
