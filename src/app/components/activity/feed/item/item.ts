import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppActivityFeedEventItem from '../event-item/event-item.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedItemPlaceholder from './placeholder/placeholder.vue';

const InviewConfig = new ScrollInviewConfig();
const InviewConfigHydration = new ScrollInviewConfig({ margin: `${Screen.windowHeight}px` });

/**
 * Can be used by the various feed components to track whether or not they're
 * the focused feed component.
 */
export const InviewConfigFocused = new ScrollInviewConfig({ trackFocused: true });

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

	readonly InviewConfig = InviewConfig;
	readonly InviewConfigHydration = InviewConfigHydration;

	mounted() {
		const height = this.feed.getItemHeight(this.item);
		if (height) {
			(this.$el as HTMLElement).style.height = height;
		}
	}

	get isBootstrapped() {
		return this.feed.isItemBootstrapped(this.item);
	}

	get height() {
		// Don't set height for notifications since they're tiny.
		return this.item.type !== 'notification' ? this.feed.getItemHeight(this.item) : undefined;
	}

	onInviewChange(inview: boolean) {
		if (inview) {
			this.feed.setItemViewed(this.item);
		}
	}

	onInviewHydrationChange(inview: boolean) {
		this.feed.setItemHydration(this.item, inview);
	}

	onResize(height: number) {
		this.feed.setItemHeight(this.item, height + 'px');
		(this.$el as HTMLElement).style.height = height + 'px';
	}
}
