import View from '!view!./overview.html?style=./overview.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppNavTabList } from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollAffix } from 'game-jolt-frontend-lib/components/scroll/affix/affix';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedNewButton } from '../../../../components/activity/feed/new-button/new-button';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppPageContainer } from '../../../../components/page-container/page-container';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';
import { Store } from '../../../../store/index';
import { AppCommunitiesViewOverviewNav } from './_nav/nav';

function getChannel(route: Route) {
	return route.params.channel || 'featured';
}

function getSort(route: Route) {
	return (route.query.sort || 'hot').toString();
}

function getFetchUrl(route: Route) {
	const channel = getChannel(route);
	const sort = getSort(route);
	const tags: string[] = [sort];

	if (channel !== 'all') {
		tags.push(channel);
	}

	let url = `/web/posts/fetch/community/${route.params.path}`;
	if (tags.length) {
		url += '?' + tags.map(tag => `tags[]=` + encodeURIComponent(tag)).join('&');
	}
	return url;
}

@View
@Component({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppPageContainer,
		AppScrollAffix,
		AppCommunitiesViewOverviewNav,
		AppPostAddButton,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppExpand,
		AppActivityFeedNewButton,
		AppNavTabList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {
		params: ['path', 'channel'],
		query: ['sort'],
	},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	tags!: string[];

	@State
	communities!: Store['communities'];

	feed: ActivityFeedView | null = null;

	readonly Screen = Screen;

	@Emit('refresh')
	emitRefresh() {}

	get routeTitle() {
		return this.community
			? this.$gettextInterpolate(`%{ community } Community`, {
					community: this.community.name,
			  })
			: null;
	}

	get channel() {
		return getChannel(this.$route);
	}

	get sort() {
		return getSort(this.$route);
	}

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4';
	}

	get shouldShowLoadNew() {
		// We need to access the reactive community from the Store here to react to is_unread changing
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (stateCommunity) {
			return this.channel === 'featured' && stateCommunity.is_unread;
		}
		return false;
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
				shouldShowCommunityControls: true,
				hideCommunityInfo: true,
				shouldShowFollow: true,
			},
			$payload.items,
			fromCache
		);
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.gotoPostFeedManage(post, this);
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		if (this.feed && this.channel === 'featured' && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}

	onPostRejected(eventItem: EventItem, community: Community) {
		if (this.feed && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}
}
