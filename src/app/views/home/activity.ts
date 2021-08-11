import { Inject, Options, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import { Store } from '../../store';
import { RouteActivityFeedController } from './feed';

@Options({
	name: 'RouteHomeActivity',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
})
export default class RouteHomeActivity extends BaseRouteComponent {
	@Inject({ from: 'route-activity-feed' })
	controller!: RouteActivityFeedController;

	@State grid!: Store['grid'];
	@State unreadActivityCount!: Store['unreadActivityCount'];

	get feed() {
		return this.controller.feed;
	}

	@Watch('unreadActivityCount', { immediate: true })
	onUnreadActivityCountChanged() {
		if (this.feed && this.unreadActivityCount > this.feed.newCount) {
			this.feed.newCount = this.unreadActivityCount;
		}
	}

	routeCreated() {
		this.controller.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved(payload: any, fromCache: boolean) {
		this.controller.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'activity',
				url: `/web/dash/activity/more/activity`,
				shouldShowFollow: true,
				notificationWatermark: payload.unreadWatermark,
				itemsPerPage: payload.perPage,
			},
			payload.items,
			fromCache
		);

		if (!fromCache) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	onLoadedNew() {
		if (this.unreadActivityCount > 0) {
			this.grid?.pushViewNotifications('activity');
		}
	}

	onLoadMore() {
		// TODO: Log this as a proper event.
		// Analytics.trackEvent(undefined, true);
	}
}
