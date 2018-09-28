import View from '!view!./activity.html?style=./activity.styl';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Mutation, State } from 'vuex-class';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { EventItem } from '../../../lib/gj-lib-client/components/event-item/event-item.model';
import { AppExpand } from '../../../lib/gj-lib-client/components/expand/expand';
import { Notification } from '../../../lib/gj-lib-client/components/notification/notification-model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { getTranslationLang } from '../../../lib/gj-lib-client/components/translate/translate.service';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { ActivityFeedContainer } from '../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';
import { AppPageHeader } from '../../components/page-header/page-header';
import { Store } from '../../store/index';

const ITEMS_PER_PAGE = 15;

@View
@Component({
	name: 'RouteActivity',
	components: {
		AppPageHeader,
		AppJolticon,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppExpand,
		AppLoading,
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

	get shouldShowHeaderImage() {
		return getTranslationLang() === 'en_US';
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
						loadMoreUrl: `/web/dash/activity/more/${this.tab}`,
						notificationWatermark: $payload.unreadWatermark,
					});
				}
			} else {
				if (!this.feed || this.feed.feedType !== 'Notification') {
					this.feed = ActivityFeedService.bootstrap(
						Notification.populate($payload.items),
						{
							type: 'Notification',
							loadMoreUrl: `/web/dash/activity/more/${this.tab}`,
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

	async loadNew() {
		// clear the current feed if we have more than 15 new items
		// that would exceed the load-per-page amount, and leave a gap in the posts
		await this.feed!.loadNew(this.unreadCount > ITEMS_PER_PAGE);
		this.setNotificationCount({ type: this.tab, count: 0 });
	}
}
