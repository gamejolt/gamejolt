import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./item.html';

import { ActivityFeedItem } from '../item-service';
import { ActivityFeedContainer } from '../feed-container-service';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { AppActivityFeedNotification } from '../notification/notification';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppActivityFeedItemPlaceholder } from './placeholder/placeholder';
import { AppActivityFeedEventItem } from '../event-item/event-item';

@View
@Component({
	components: {
		AppScrollInview,
		AppActivityFeedEventItem,
		AppActivityFeedNotification,
		AppActivityFeedItemPlaceholder,
	},
})
export class AppActivityFeedItem extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(ActivityFeedContainer) feed: ActivityFeedContainer;

	inviewPadding = Screen.windowHeight;

	mounted() {
		if (this.item.height) {
			this.$el.style.height = this.item.height;
		}
	}

	get isNew() {
		// Only care if there is a watermark.
		if (this.feed.notificationWatermark === 0) {
			return false;
		}

		return this.item.feedItem.added_on > this.feed.notificationWatermark;
	}

	get isBootstrapped() {
		return GJ_IS_SSR || typeof this.feed.bootstrappedItems[this.item.id] !== 'undefined';
	}

	get isHydrated() {
		return GJ_IS_SSR || typeof this.feed.hydratedItems[this.item.id] !== 'undefined';
	}

	get isActive() {
		return this.feed.activeItem && this.feed.activeItem.id === this.item.id;
	}

	get height() {
		// Don't set height for notifications since they're tiny.
		return this.item.type !== 'notification' ? this.item.height : undefined;
	}

	setActive() {
		this.feed.activeItem = this.item;
	}

	onExpanded() {
		this.feed.expanded(this.item);
	}

	onInviewChange(visible: boolean) {
		this.feed.inViewChange(this.item, visible);
	}

	onResize(height: number) {
		this.$el.style.height = height + 'px';
		this.item.height = height + 'px';
	}
}
