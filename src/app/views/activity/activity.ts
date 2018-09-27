import View from '!view!./activity.html?style=./activity.styl';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Mutation } from 'vuex-class';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { getTranslationLang } from '../../../lib/gj-lib-client/components/translate/translate.service';
import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
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
		AppJolticon,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
	},
})
export default class RouteActivity extends BaseRouteComponent {
	@Prop(String)
	tab!: 'activity' | 'notifications';

	@Mutation
	setNotificationCount!: Store['setNotificationCount'];

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
		this.feed = ActivityFeedService.routeInit(this);
	}

	routed($payload: any) {
		if (this.tab === 'activity') {
			this.feed = ActivityFeedService.routed(
				this.feed,
				{
					type: 'EventItem',
					url: `/web/dash/activity/more/${this.tab}`,
					notificationWatermark: $payload.unreadWatermark,
				},
				$payload.items
			);
		} else {
			this.feed = ActivityFeedService.routed(
				this.feed,
				{
					type: 'Notification',
					url: `/web/dash/activity/more/${this.tab}`,
					notificationWatermark: $payload.unreadWatermark,
				},
				$payload.items
			);
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
