import Vue from 'vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../_common/fireside/post/video/video-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { ScrollInviewController } from '../../../../../_common/scroll/inview/controller';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppActivityFeedEventItem from '../event-item/event-item.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedItemPlaceholder from './placeholder/placeholder.vue';

const InviewConfigFocused = new ScrollInviewConfig({ trackFocused: true });
const InviewConfigHydration = new ScrollInviewConfig({ margin: `${Screen.windowHeight}px` });

@Component({
	components: {
		AppScrollInview,
		AppActivityFeedEventItem,
		AppActivityFeedNotification,
		AppActivityFeedItemPlaceholder,
	},
})
export default class AppActivityFeedItem extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	readonly inviewController = new ScrollInviewController();
	readonly InviewConfigHydration = InviewConfigHydration;

	mounted() {
		const height = this.feed.getItemHeight(this.item);
		if (height) {
			(this.$el as HTMLElement).style.height = height;
		}
	}

	/**
	 * We only track the focused info for some stuff in the feed. This allows
	 * these items to live within feeds of other content and still get focus if
	 * they're not the top item in the feed (they only calculate against each
	 * other).
	 */
	get InviewConfigFocused() {
		const { feedItem } = this.item;
		if (!(feedItem instanceof EventItem) || !(feedItem.action instanceof FiresidePost)) {
			return;
		}

		// We currently only track focused states for gamejolt videos.
		return feedItem.action.videos[0]?.provider === FiresidePostVideo.PROVIDER_GAMEJOLT
			? InviewConfigFocused
			: undefined;
	}

	get isBootstrapped() {
		return this.feed.isItemBootstrapped(this.item);
	}

	get height() {
		// Don't set height for notifications since they're tiny.
		return this.item.type !== 'notification' ? this.feed.getItemHeight(this.item) : undefined;
	}

	@Watch('inviewController.isFocused')
	onInviewFocusedChange() {
		this.feed.setItemFocused(this.item, this.inviewController.isFocused ?? false);
	}

	@Watch('inviewController.isInview')
	onInviewThresholdChange() {
		if (this.inviewController.isInview) {
			this.feed.setItemViewed(this.item);
		}
	}

	onInviewHydrationChange(visible: boolean) {
		this.feed.setItemHydration(this.item, visible);
	}

	onResize(height: number) {
		this.feed.setItemHeight(this.item, height + 'px');
		(this.$el as HTMLElement).style.height = height + 'px';
	}
}
