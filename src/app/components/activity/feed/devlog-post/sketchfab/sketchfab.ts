import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { AppResponsiveDimensions } from '../../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppSketchfabEmbed from '../../../../../../_common/sketchfab/embed/embed.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';

@Component({
	components: {
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedDevlogPostSketchfab extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	isShowing = GJ_IS_SSR;

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get sketchfab() {
		return this.post.sketchfabs[0];
	}

	play() {
		this.isShowing = true;
		Analytics.trackEvent('activity-feed', 'sketchfab-play');
	}
}
