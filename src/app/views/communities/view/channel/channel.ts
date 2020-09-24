import { Component, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { EventBus, EventBusDeregister } from '../../../../../system/event/event-bus.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import {
	ClearNotificationsEventData,
	GRID_CLEAR_NOTIFICATIONS_EVENT,
} from '../../../../components/grid/client.service';
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

	@State
	grid!: Store['grid'];

	feed: ActivityFeedView | null = null;
	clearNotificationsDeregister?: EventBusDeregister;

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
					this.$gettextInterpolate('Hot posts in %{ channel }', {
						channel: this.channelPath,
					})
				);
			case 'new':
				return prefixWith(
					this.$gettextInterpolate('New posts in %{ channel }', {
						channel: this.channelPath,
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

			this.pushViewToGrid();

			this.clearNotificationsDeregister = EventBus.on(
				GRID_CLEAR_NOTIFICATIONS_EVENT,
				(data: ClearNotificationsEventData) => {
					if (
						data.type === 'community-channel' &&
						data.data.communityId === this.community.id &&
						data.data.channelId === this.channel.id
					) {
						this.feed?.loadNew(15);
					}
				}
			);
		}

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}
	}

	routeDestroyed() {
		if (this.clearNotificationsDeregister) {
			this.clearNotificationsDeregister();
			this.clearNotificationsDeregister = undefined;
		}
	}

	loadedNew() {
		if (!isVirtualChannel(this.routeStore, this.channel)) {
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
