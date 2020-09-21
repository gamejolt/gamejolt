import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppResponsiveDimensions } from '../../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppSketchfabEmbed from '../../../../../../_common/sketchfab/embed/embed.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedView } from '../../view';

@Component({
	components: {
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedDevlogPostSketchfab extends Vue {
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
		Analytics.trackEvent('activity-feed', 'sketchfab-play');
	}
}
