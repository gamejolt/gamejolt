import { Component, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { Store } from '../../../../store';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	isVirtualChannel,
	setCommunityMeta,
} from '../view.store';
import {
	doFeedChannelPayload,
	getFeedChannelSort,
	resolveFeedChannelPayload,
} from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

/**
 * Route dependencies for channel-type pages.
 */
export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};

@Component({
	name: 'RouteCommunitiesViewChannel',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitiesViewFeed,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewChannel extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey)
	routeStore!: CommunityRouteStore;

	@State communityStates!: Store['communityStates'];

	feed: ActivityFeedView | null = null;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get channelPath() {
		return this.routeStore.channelPath;
	}

	get sort() {
		return getFeedChannelSort(this.$route);
	}

	get routeTitle() {
		this.disableRouteTitleSuffix = true;

		let title = this.$gettextInterpolate(`%{ name } Community on Game Jolt`, {
			name: this.community.name,
		});

		const prefixWith = (prefix: string) => `${prefix} - ${title}`;

		if (this.channel === this.routeStore.allChannel) {
			switch (this.sort) {
				case 'hot':
					return prefixWith(this.$gettext('Hot posts'));
				case 'new':
					return prefixWith(this.$gettext('New posts'));
			}
		}

		switch (this.sort) {
			case 'hot':
				return prefixWith(
					this.$gettextInterpolate('Hot %{ tag } posts', {
						tag: this.channel,
					})
				);
			case 'new':
				return prefixWith(
					this.$gettextInterpolate('New %{ tag } posts', {
						tag: this.channel,
					})
				);
		}

		return title;
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = resolveFeedChannelPayload(
			this.feed,
			this.community,
			this.$route,
			$payload,
			fromCache
		);

		if (!isVirtualChannel(this.routeStore, this.channel)) {
			this.communityState.markChannelRead(this.channel.id);
		}

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}
}
