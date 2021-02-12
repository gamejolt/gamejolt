import { Component, Inject } from 'vue-property-decorator';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import { RouteActivityFeedController } from './feed';

@Component({
	name: 'RouteHomeFYP',
	components: {
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	resolver: ({ route }) =>
		Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/posts/for-you')),
})
export default class RouteHomeFYP extends BaseRouteComponent {
	@Inject('route-activity-feed')
	controller!: RouteActivityFeedController;

	get feed() {
		return this.controller.feed;
	}

	routeCreated() {
		this.controller.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.controller.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'fyp',
				url: `/web/posts/for-you`,
				shouldShowFollow: true,
				shouldShowDates: false,
				itemsPerPage: $payload.perPage,
			},
			$payload.items,
			fromCache
		);
	}

	onLoadMore() {
		Analytics.trackPageview(undefined, true);
	}
}
