import View from '!view!./overview.html?style=./overview.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppPill } from 'game-jolt-frontend-lib/components/pill/pill';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppKnownUsers } from '../../../../../lib/gj-lib-client/components/user/known/known';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedNewButton } from '../../../../components/activity/feed/new-button/new-button';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';
import { Store } from '../../../../store/index';

function getTab(route: Route) {
	return route.params.tab || 'featured';
}

function getFetchUrl(route: Route) {
	const tags = [getTab(route)];

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
		AppPostAddButton,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppPill,
		AppExpand,
		AppActivityFeedNewButton,
		AppKnownUsers,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {
		params: ['path', 'tab'],
	},
	resolver: ({ route }) =>
		Promise.all([
			Api.sendRequest(getFetchUrl(route)),
			Api.sendRequest('/web/communities/overview/' + route.params.path),
		]),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	tags!: string[];

	@Prop(Number)
	unreadWatermark!: number;

	@State
	app!: Store['app'];

	@State
	communities!: Store['communities'];

	feed: ActivityFeedView | null = null;
	knownMembers: User[] = [];
	knownMemberCount: number = 0;

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

	get tab() {
		return getTab(this.$route);
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
			return this.tab === 'featured' && stateCommunity.is_unread;
		}
		return false;
	}

	get shouldShowKnownMembers() {
		return this.app.user && this.knownMembers && this.knownMembers.length > 0;
	}

	get membersYouKnowCount() {
		if (this.knownMemberCount && this.knownMemberCount > 0) {
			if (this.knownMemberCount <= 10) {
				return this.knownMemberCount.toString();
			}
			return '10+';
		}
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		const [itemsPayload, overviewPayload] = $payload;
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
				shouldShowCommunityControls: true,
				hideCommunityInfo: true,
				shouldShowFollow: true,
				notificationWatermark: this.unreadWatermark,
			},
			itemsPayload.items,
			fromCache
		);
		this.knownMembers = overviewPayload.knownMembers || [];
		this.knownMemberCount = overviewPayload.knownMemberCount || 0;
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.gotoPostFeedManage(post, this);
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		if (this.feed && this.tab === 'featured' && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}

	onPostRejected(eventItem: EventItem, community: Community) {
		if (this.feed && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}
}
