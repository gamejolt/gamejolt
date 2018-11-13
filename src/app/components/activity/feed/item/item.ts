import View from '!view!./item.html';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { AppActivityFeedEventItem } from '../event-item/event-item';
import { ActivityFeedItem } from '../item-service';
import { AppActivityFeedNotification } from '../notification/notification';
import { ActivityFeedView } from '../view';
import { AppActivityFeedItemPlaceholder } from './placeholder/placeholder';

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
	@Inject()
	feed!: ActivityFeedView;

	@Prop(ActivityFeedItem)
	item!: ActivityFeedItem;

	inviewPadding = Screen.windowHeight;

	mounted() {
		const height = this.feed.getItemHeight(this.item);
		if (height) {
			this.$el.style.height = height;
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
		this.$el.style.height = height + 'px';
	}
}
