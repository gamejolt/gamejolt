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
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppActivityFeed } from '../../../../components/activity/feed/feed';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { AppActivityFeedNewButton } from '../../../../components/activity/feed/new-button/new-button';
import { AppActivityFeedPlaceholder } from '../../../../components/activity/feed/placeholder/placeholder';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppPostAddButton } from '../../../../components/post/add-button/add-button';
import { Store } from '../../../../store/index';

function getFetchUrl(route: Route, tags: string[]) {
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
	},
})
@RouteResolver({
	cache: false,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route, ['featured'])),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	@State
	communities!: Store['communities'];

	feed: ActivityFeedView | null = null;

	activeTag = '';
	searchId = 0;

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

	get shouldShowLoadNew() {
		// We need to access the reactive community from the Store here to react to is_unread changing
		const stateCommunity = this.communities.find(c => c.id == this.community.id);
		if (stateCommunity) {
			return this.activeTag === 'featured' && stateCommunity.is_unread;
		}
		return false;
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
		this.activeTag = 'featured';
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route, ['featured']),
				shouldShowCommunityControls: true,
			},
			$payload.items,
			fromCache
		);
	}

	async setActiveTag(tag: string) {
		const searchId = ++this.searchId;

		this.activeTag = tag;
		this.feed = null;

		const loadUrl = getFetchUrl(this.$route, [this.activeTag]);
		const payload = await Api.sendRequest(loadUrl);

		if (searchId !== this.searchId) {
			return;
		}

		this.feed = ActivityFeedService.routed(
			null,
			{
				type: 'EventItem',
				url: loadUrl,
				shouldShowCommunityControls: true,
			},
			payload.items,
			false
		);
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.gotoPostFeedManage(post, this);
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		if (this.activeTag === 'featured' && this.community.id === community.id) {
			this.feed!.remove([eventItem]);
		}
	}
}
