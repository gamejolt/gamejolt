import View from '!view!./overview.html?style=./overview.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppPill } from 'game-jolt-frontend-lib/components/pill/pill';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';

function getFetchUrl(route: Route) {
	return `/web/posts/fetch/community/${route.params.path}`;
}

@View
@Component({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppPostAddButton,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppPill,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	feed: ActivityFeedView | null = null;

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4';
	}

	get routeTitle() {
		return this.community
			? this.$gettextInterpolate(`%{ community } Community`, {
					community: this.community.name,
					// tslint:disable-next-line:indent
			  })
			: null;
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
			},
			$payload.items,
			fromCache
		);
	}
}
