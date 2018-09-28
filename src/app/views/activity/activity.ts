import View from '!view!./activity.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Mutation, State } from 'vuex-class';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { EventItem } from '../../../lib/gj-lib-client/components/event-item/event-item.model';
import { Notification } from '../../../lib/gj-lib-client/components/notification/notification-model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';
import { AppPageHeader } from '../../components/page-header/page-header';
import { Store } from '../../store/index';

@View
@Component({
	name: 'RouteActivity',
	components: {
		AppPageHeader,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteActivity extends BaseRouteComponent {
	@Prop(String)
	tab!: 'activity' | 'notifications';

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

	@State
	app!: Store['app'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	@Mutation
	incrementNotificationCount!: Store['incrementNotificationCount'];

	feed: ActivityFeedContainer | null = null;

	readonly Screen = Screen;

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/activity/' + route.params.tab);
	}

	get routeTitle() {
		return this.tab === 'activity'
			? this.$gettext('Your Activity Feed')
			: this.$gettext('Your Notifications');
	}

	get unreadCount() {
		switch (this.tab) {
			case 'activity':
				return this.unreadActivityCount;
			case 'notifications':
				return this.unreadNotificationsCount;
		}
		return 0;
	}

	routeInit() {
		// Try to pull from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	routed($payload: any, fromCache: boolean) {
		// Never pull data from cache for feed since the feed is already bootstrapped from its own
		// cache.
		if (!fromCache) {
			if (this.tab === 'activity') {
				if (!this.feed || this.feed.feedType !== 'EventItem') {
					this.feed = ActivityFeedService.bootstrap(EventItem.populate($payload.items), {
						type: 'EventItem',
						url: `/web/dash/activity/more/${this.tab}`,
						notificationWatermark: $payload.unreadWatermark,
					});
				}
			} else {
				if (!this.feed || this.feed.feedType !== 'Notification') {
					this.feed = ActivityFeedService.bootstrap(
						Notification.populate($payload.items),
						{
							type: 'Notification',
							url: `/web/dash/activity/more/${this.tab}`,
							notificationWatermark: $payload.unreadWatermark,
						}
					);
				}
			}
		}

		// we clear the notifications for the tab we are on
		this.setNotificationCount({ type: this.tab, count: 0 });

		// set the other notification count
		if (this.tab === 'activity') {
			this.setNotificationCount({
				type: 'notifications',
				count: $payload.notificationsUnreadCount,
			});
		} else {
			this.setNotificationCount({ type: 'activity', count: $payload.activityUnreadCount });
		}
	}

	addNotificationCount() {
		this.incrementNotificationCount({ count: 1, type: 'notifications' });
	}

	addActivityCount() {
		this.incrementNotificationCount({ count: 1, type: 'activity' });
	}

	loadedNew() {
		this.setNotificationCount({ type: this.tab, count: 0 });
	}
}
