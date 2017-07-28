import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html';

import { ActivityFeedItem } from '../item-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedContainer } from '../feed-container-service';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { AppActivityFeedDevlogPost } from '../devlog-post/devlog-post';
import { AppActivityFeedNotification } from '../notification/notification';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	components: {
		AppScrollInview,
		AppActivityFeedDevlogPost,
		AppActivityFeedNotification,
	},
})
export class AppActivityFeedItem extends Vue {
	@Prop(ActivityFeedItem) item: ActivityFeedItem;
	@Prop(ActivityFeedContainer) feed: ActivityFeedContainer;

	inviewPadding = Screen.windowHeight;

	get isNew() {
		// Only care if there is a watermark.
		if (this.feed.notificationWatermark === 0) {
			return false;
		}

		if (this.item.feedItem instanceof Notification) {
			return this.item.feedItem.added_on > this.feed.notificationWatermark;
		} else if (this.item.feedItem instanceof FiresidePost) {
			return this.item.feedItem.published_on > this.feed.notificationWatermark;
		}
	}

	get isInView() {
		return GJ_IS_SSR || !!this.feed.inViewItems[this.item.id];
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
		this.item.height = height + 'px';
	}
}
