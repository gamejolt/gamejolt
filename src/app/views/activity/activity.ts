import { Route } from 'vue-router';
import { Mutation } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./activity.html?style=./activity.styl';

import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { ActivityFeedContainer } from '../../components/activity/feed/feed-container-service';
import { Notification } from '../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';
import { Store } from '../../store/index';
import { EventItem } from '../../../lib/gj-lib-client/components/event-item/event-item.model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { getTranslationLang } from '../../../lib/gj-lib-client/components/translate/translate.service';
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
	@Prop(String) tab!: 'activity' | 'notifications';

	@Mutation setNotificationCount!: Store['setNotificationCount'];

	feed: ActivityFeedContainer | null = null;
	activityUnreadCount = 0;
	notificationsUnreadCount = 0;

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

		this.activityUnreadCount = $payload.activityUnreadCount || 0;
		this.notificationsUnreadCount = $payload.notificationsUnreadCount || 0;

		// Since we clear out the notifications on the page let's set the count
		// as being the opposite of the tab we're on.
		this.setNotificationCount(
			this.tab === 'activity' ? this.notificationsUnreadCount : this.activityUnreadCount
		);
	}
}
