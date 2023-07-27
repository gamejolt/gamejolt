<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Watch } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../../../_common/illustration/illustrations';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { useGridStore } from '../../../../components/grid/grid-store';
import { useAppStore } from '../../../../store';
import {
	doFeedChannelPayload,
	getFeedChannelSort,
	resolveFeedChannelPayload,
} from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	isVirtualChannel,
	setCommunityMeta,
} from '../view.store';
import { CommunitiesViewChannelDeps } from './channel.vue';

@Options({
	name: 'RouteCommunitiesViewChannelFeed',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitiesViewFeed,
		AppIllustration,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewChannelFeed extends LegacyRouteComponent {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	gridStore = setup(() => useGridStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get user() {
		return this.commonStore.user;
	}
	get communityStates() {
		return this.store.communityStates;
	}
	get grid() {
		return this.gridStore.grid;
	}

	feed: ActivityFeedView | null = null;

	/** @override */
	disableRouteTitleSuffix = true;

	readonly Screen = Screen;
	readonly illNoComments = illNoComments;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channel;
	}

	get channelPath() {
		return this.routeStore.channelPath;
	}

	get sort() {
		return getFeedChannelSort(this.$route);
	}

	get routeTitle() {
		if (!this.channel) {
			return null;
		}

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

	@Watch('communityState.unreadChannels', { immediate: true, deep: true })
	onChannelUnreadChanged() {
		if (
			this.feed &&
			this.feed.newCount === 0 &&
			this.channel &&
			this.communityState.unreadChannels.includes(this.channel.id)
		) {
			this.feed.newCount = 1;
		}
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this.isRouteBootstrapped);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = resolveFeedChannelPayload(
			this.feed,
			this.community,
			this.$route,
			$payload,
			fromCache
		);

		if (
			!fromCache &&
			this.user &&
			this.channel &&
			!isVirtualChannel(this.routeStore, this.channel)
		) {
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
			this.channel &&
			!isVirtualChannel(this.routeStore, this.channel) &&
			this.communityState.unreadChannels.includes(this.channel.id)
		) {
			this.pushViewToGrid();
		}
	}

	private pushViewToGrid() {
		this.grid?.pushViewNotifications('community-channel', {
			communityId: this.community.id,
			channelId: this.channel?.id,
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
		ActivityFeedService.onPostAdded({
			feed: this.feed!,
			post,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<template #default>
			<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
				<AppTranslate v-if="channel === routeStore.allChannel">All Posts</AppTranslate>
				<template v-else-if="channel">{{ channel.displayTitle }}</template>
				<small v-if="Screen.isDesktop">{{ ' ' }} in {{ community.name }}</small>
			</h1>

			<div v-if="channel && channel.visibility === 'draft'">
				<AppIllustration :asset="illNoComments">
					<AppTranslate>
						This is a draft channel. When it gets published, the post feed will appear
						here.
					</AppTranslate>
				</AppIllustration>
			</div>
			<AppCommunitiesViewFeed
				v-else
				:feed="feed"
				@add-post="onPostAdded"
				@load-new="loadedNew"
			/>
		</template>
	</AppCommunitiesViewPageContainer>
</template>

<style lang="stylus" scoped>
.-text-overflow
	text-overflow()
	max-width: 100%
</style>
