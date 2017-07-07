import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./activity.html';

import { RouteResolve } from '../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { ActivityFeedContainer } from '../../components/activity/feed/feed-container-service';
import { Notification } from '../../../lib/gj-lib-client/components/notification/notification-model';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { FiresidePost } from '../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppPageHeader } from '../../components/page-header/page-header';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppActivityFeed } from '../../components/activity/feed/feed';
import { AppActivityFeedPlaceholder } from '../../components/activity/feed/placeholder/placeholder';

@View
@Component({
	components: {
		AppPageHeader,
		AppJolticon,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteActivity extends Vue {
	@Prop([String])
	tab: 'activity' | 'notifications';

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

			if (!this.feed || this.feed.feedType !== 'Fireside_Post') {
				this.feed = ActivityFeedService.bootstrap(
					FiresidePost.populate(this.$payload.items),
					{
						type: 'Fireside_Post',
						url: `/web/dash/activity/more/${this.tab}`,
						notificationWatermark: this.$payload.unreadWatermark,
					}
				);
			}
		} else {
			Meta.title = this.$gettext('Your Notifications');

			if (!this.feed || this.feed.feedType !== 'Notification') {
				this.feed = ActivityFeedService.bootstrap(
					Notification.populate(this.$payload.items),
					{
						type: 'Notification',
						url: `/web/dash/activity/more/${this.tab}`,
						notificationWatermark: this.$payload.unreadWatermark,
					}
				);
			}
		}

		this.activityUnreadCount = this.$payload.activityUnreadCount || 0;
		this.notificationsUnreadCount = this.$payload.notificationsUnreadCount || 0;

		// TODO: Make this a vuex thing?
		// Update the notification count directive to show the new unread count.
		// $rootScope.$broadcast( 'NotificationCount.refresh' );
	}
}
