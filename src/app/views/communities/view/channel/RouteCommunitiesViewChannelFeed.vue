<script lang="ts">
import { computed, Ref, ref, toRef, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import { useGridStore } from '~app/components/grid/grid-store';
import { useAppStore } from '~app/store';
import AppCommunitiesViewFeed from '~app/views/communities/view/_feed/AppCommunitiesViewFeed.vue';
import {
	doFeedChannelPayload,
	getFeedChannelSort,
	resolveFeedChannelPayload,
} from '~app/views/communities/view/_feed/feed-helpers';
import AppCommunityPageContainer from '~app/views/communities/view/_page-container/AppCommunityPageContainer.vue';
import { CommunitiesViewChannelDeps } from '~app/views/communities/view/channel/RouteCommunitiesViewChannel.vue';
import {
	isVirtualChannel,
	setCommunityMeta,
	useCommunityRouteStore,
} from '~app/views/communities/view/view.store';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoComments } from '~common/illustration/illustrations';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { getScreen } from '~common/screen/screen-service';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: CommunitiesViewChannelDeps as any,
		resolver: ({ route }) => doFeedChannelPayload(route),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;
const { communityStates } = useAppStore();
const { grid } = useGridStore();
const { user } = useCommonStore();
const route = useRoute();
const { isMobile, isDesktop } = getScreen();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const community = toRef(() => routeStore.community);
const channel = toRef(() => routeStore.channel);
const channelPath = toRef(() => routeStore.channelPath!);

const sort = computed(() => getFeedChannelSort(route));
const communityState = computed(() => communityStates.value.getCommunityState(community.value));

const routeTitle = computed(() => {
	if (!channel.value) {
		return null;
	}

	const title = $gettext(`%{ name } Community on Game Jolt`, {
		name: community.value.name,
	});

	const prefixWith = (prefix: string) => `${prefix} - ${title}`;

	if (channel.value.type === 'competition') {
		return prefixWith(channel.value.displayTitle);
	}

	if (channel.value === routeStore.allChannel) {
		switch (sort.value) {
			case 'hot':
				return prefixWith($gettext('Hot posts'));
			case 'new':
				return prefixWith($gettext('New posts'));
		}
	}

	switch (sort.value) {
		case 'hot':
			return prefixWith(
				$gettext('Hot posts in %{ channel }', {
					channel: channel.value ? channel.value.displayTitle : channelPath.value,
				})
			);
		case 'new':
			return prefixWith(
				$gettext('New posts in %{ channel }', {
					channel: channel.value ? channel.value.displayTitle : channelPath.value,
				})
			);
	}

	return title;
});

watchEffect(() => {
	if (
		feed.value &&
		feed.value.newCount === 0 &&
		channel.value &&
		communityState.value.unreadChannels.includes(channel.value.id)
	) {
		feed.value.newCount = 1;
	}
});

function loadedNew() {
	// Check that the channel is still unread after loading new posts.
	// It might be read after posts have been loaded in a different client.
	if (
		user.value &&
		channel.value &&
		!isVirtualChannel(routeStore, channel.value) &&
		communityState.value.unreadChannels.includes(channel.value.id)
	) {
		pushViewToGrid();
	}
}

function pushViewToGrid() {
	grid.value?.pushViewNotifications('community-channel', {
		communityId: community.value.id,
		channelId: channel.value?.id,
	});

	// When the entire community has no unreads left, push that event to grid.
	// Users that haven't looked at a community in their session yet will have the
	// "hasUnreadPosts" bool set to true from the Grid bootstrap.
	// To set it to false, we push this event through Grid.
	if (!communityState.value.isUnread) {
		grid.value?.pushViewNotifications('community-unread', {
			communityId: community.value.id,
		});
	}
}

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		route: route,
		appRoute: appRoute,
	});
}

const appRoute = createAppRoute({
	routeTitle,
	disableTitleSuffix: true,
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		feed.value = resolveFeedChannelPayload(
			feed.value,
			community.value,
			route,
			payload,
			fromCache
		);
		isBootstrapped.value = true;

		if (
			!fromCache &&
			user.value &&
			channel.value &&
			!isVirtualChannel(routeStore, channel.value)
		) {
			pushViewToGrid();
		}

		if (routeTitle.value) {
			setCommunityMeta(community.value, routeTitle.value);
		}
	},
});
</script>

<template>
	<AppCommunityPageContainer>
		<template #default>
			<h1 class="section-header" :class="{ 'h2 -text-overflow': isMobile }">
				<template v-if="channel === routeStore.allChannel">
					{{ $gettext(`All Posts`) }}
				</template>
				<template v-else-if="channel">{{ channel.displayTitle }}</template>
				<small v-if="isDesktop">{{ ' ' }} in {{ community.name }}</small>
			</h1>

			<div v-if="channel && channel.visibility === 'draft'">
				<AppIllustration :asset="illNoComments">
					{{
						$gettext(
							`This is a draft channel. When it gets published, the post feed will appear here.`
						)
					}}
				</AppIllustration>
			</div>
			<AppCommunitiesViewFeed
				v-else
				:feed="feed"
				@add-post="onPostAdded"
				@load-new="loadedNew"
			/>
		</template>
	</AppCommunityPageContainer>
</template>

<style lang="stylus" scoped>
.-text-overflow
	text-overflow()
	max-width: 100%
</style>
