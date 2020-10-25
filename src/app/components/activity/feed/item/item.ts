import Vue from 'vue';
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { ScrollInviewController } from '../../../../../_common/scroll/inview/controller';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppActivityFeedEventItem from '../event-item/event-item.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedItemPlaceholder from './placeholder/placeholder.vue';

const InviewConfig = new ScrollInviewConfig({ trackFocused: true });
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
	readonly InviewConfig = InviewConfig;

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
