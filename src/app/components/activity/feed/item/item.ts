import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollInview } from 'game-jolt-frontend-lib/components/scroll/inview/inview';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import AppActivityFeedEventItem from '../event-item/event-item.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import { ActivityFeedView } from '../view';
import AppActivityFeedItemPlaceholder from './placeholder/placeholder.vue';

@Component({
	components: {
		AppScrollInview,
		AppActivityFeedEventItem,
		AppActivityFeedNotification,
		AppActivityFeedItemPlaceholder,
	},
})
export default class AppActivityFeedItem extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	inviewPadding = Screen.windowHeight;

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

	onExpanded() {
		this.feed.setItemExpanded(this.item);
	}

	onInviewChange(visible: boolean) {
		this.feed.inviewChange(this.item, visible);
	}

	onResize(height: number) {
		this.feed.setItemHeight(this.item, height + 'px');
		(this.$el as HTMLElement).style.height = height + 'px';
	}
}
