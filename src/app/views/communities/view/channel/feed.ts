import { Inject, Options, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/illustration.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
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
import { CommunitiesViewChannelDeps } from './channel';

@Options({
	name: 'RouteCommunitiesViewChannelFeed',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitiesViewFeed,
		AppIllustration,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewChannelFeed extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	@AppState user!: AppStore['user'];
	@State communityStates!: Store['communityStates'];
	@State grid!: Store['grid'];

	feed: ActivityFeedView | null = null;

	/** @override */
	disableRouteTitleSuffix = true;

	readonly Screen = Screen;

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
		const title = this.$gettextInterpolate(`%{ name } Community on Game Jolt`, {
			name: this.community.name,
		});

		const prefixWith = (prefix: string) => `${prefix} - ${title}`;

		if (this.channel.type === 'competition') {
			return prefixWith(this.channel.displayTitle);
		}

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
					this.$gettextInterpolate('Hot posts in %{ channel }', {
						channel: this.channel ? this.channel.displayTitle : this.channelPath,
					})
				);
			case 'new':
				return prefixWith(
					this.$gettextInterpolate('New posts in %{ channel }', {
						channel: this.channel ? this.channel.displayTitle : this.channelPath,
					})
				);
		}

		return title;
	}

	@Watch('communityState.unreadChannels', { immediate: true })
	onChannelUnreadChanged() {
		if (
			this.feed &&
			this.feed.newCount === 0 &&
			this.communityState.unreadChannels.includes(this.channel.id)
		) {
			this.feed.newCount = 1;
		}
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

		if (!fromCache && this.user && !isVirtualChannel(this.routeStore, this.channel)) {
			this.pushViewToGrid();
		}

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}
	}

	loadedNew() {
		// Check that the channel is still unread after loading new posts.
		// It might be read after posts have been loaded in a different client.
		if (
			this.user &&
			!isVirtualChannel(this.routeStore, this.channel) &&
			this.communityState.unreadChannels.includes(this.channel.id)
		) {
			this.pushViewToGrid();
		}
	}

	private pushViewToGrid() {
		this.grid?.pushViewNotifications('community-channel', {
			communityId: this.community.id,
			channelId: this.channel.id,
		});

		// When the entire community has no unreads left, push that event to grid.
		// Users that haven't looked at a community in their session yet will have the
		// "hasUnreadPosts" bool set to true from the Grid bootstrap.
		// To set it to false, we push this event through Grid.
		if (!this.communityState.isUnread) {
			this.grid?.pushViewNotifications('community-unread', {
				communityId: this.community.id,
			});
		}
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}
}
