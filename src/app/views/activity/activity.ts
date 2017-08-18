import VueRouter from 'vue-router';
import { Mutation } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./activity.html';

import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { ActivityFeedContainer } from '../../components/activity/feed/feed-container-service';
import { Notification } from '../../../lib/gj-lib-client/components/notification/notification-model';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';
import { Store } from '../../store/index';
import { EventItem } from '../../../lib/gj-lib-client/components/event-item/event-item.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteActivity',
	components: {
		AppPageHeader,
		AppJolticon,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteActivity extends BaseRouteComponent {
	@Prop(String) tab: 'activity' | 'notifications';

	@Mutation setNotificationCount: Store['setNotificationCount'];

	feed: ActivityFeedContainer | null = null;
	activityUnreadCount = 0;
	notificationsUnreadCount = 0;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/activity/' + route.params.tab);
	}

	routeInit() {
		// Try to pull from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed() {
		if (this.tab === 'activity') {
			Meta.title = this.$gettext('Your Activity Feed');

			if (!this.feed || this.feed.feedType !== 'EventItem') {
				this.feed = ActivityFeedService.bootstrap(EventItem.populate(this.$payload.items), {
					type: 'EventItem',
					url: `/web/dash/activity/more/${this.tab}`,
					notificationWatermark: this.$payload.unreadWatermark,
				});
			}
		} else {
			Meta.title = this.$gettext('Your Notifications');

			if (!this.feed || this.feed.feedType !== 'Notification') {
				this.feed = ActivityFeedService.bootstrap(Notification.populate(this.$payload.items), {
					type: 'Notification',
					url: `/web/dash/activity/more/${this.tab}`,
					notificationWatermark: this.$payload.unreadWatermark,
				});
			}
		}

		this.activityUnreadCount = this.$payload.activityUnreadCount || 0;
		this.notificationsUnreadCount = this.$payload.notificationsUnreadCount || 0;

		// Since we clear out the notifications on the page let's set the count
		// as being the opposite of the tab we're on.
		this.setNotificationCount(
			this.tab === 'activity' ? this.notificationsUnreadCount : this.activityUnreadCount
		);
	}
}
