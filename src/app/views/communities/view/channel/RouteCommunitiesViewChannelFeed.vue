<script lang="ts">
import { PropType, Ref, computed, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../../../_common/illustration/illustrations';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { useGridStore } from '../../../../components/grid/grid-store';
import { useAppStore } from '../../../../store';
import AppCommunitiesViewFeed from '../_feed/AppCommunitiesViewFeed.vue';
import {
	doFeedChannelPayload,
	getFeedChannelSort,
	resolveFeedChannelPayload,
} from '../_feed/feed-helpers';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { isVirtualChannel, setCommunityMeta, useCommunityRouteStore } from '../view.store';
import { CommunitiesViewChannelDeps } from './RouteCommunitiesViewChannel.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: CommunitiesViewChannelDeps,
		resolver: ({ route }) => doFeedChannelPayload(route),
	}),
};
</script>

<script lang="ts" setup>
const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
});

const { community, channel } = toRefs(props);

const routeStore = useCommunityRouteStore()!;
const { allChannel } = routeStore;
const { communityStates } = useAppStore();
const { grid } = useGridStore();
const { user } = useCommonStore();
const route = useRoute();
const router = useRouter();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const sort = computed(() => getFeedChannelSort(route));
const communityState = computed(() => communityStates.value.getCommunityState(community.value));

const routeTitle = computed(() => {
	const title = $gettext(`%{ name } Community on Game Jolt`, {
		name: community.value.name,
	});

	const prefixWith = (prefix: string) => `${prefix} - ${title}`;

	if (channel.value.type === 'competition') {
		return prefixWith(channel.value.displayTitle);
	}

	if (channel.value === allChannel.value) {
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
					channel: channel.value.displayTitle,
				})
			);
		case 'new':
			return prefixWith(
				$gettext('New posts in %{ channel }', {
					channel: channel.value.displayTitle,
				})
			);
	}

	return title;
});

watch(
	() => communityState.value?.unreadChannels,
	unreadChannels => {
		if (feed.value?.newCount === 0 && unreadChannels?.includes(channel.value.id)) {
			feed.value.newCount = 1;
		}
	},
	{ immediate: true, deep: true }
);

function loadedNew() {
	// Check that the channel is still unread after loading new posts.
	// It might be read after posts have been loaded in a different client.
	if (
		user.value &&
		!isVirtualChannel(routeStore, channel.value!) &&
		communityState.value?.unreadChannels.includes(channel.value.id)
	) {
		pushViewToGrid();
	}
}

function pushViewToGrid() {
	grid.value?.pushViewNotifications('community-channel', {
		communityId: community.value.id,
		channelId: channel.value.id,
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
		router: router,
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

		if (!fromCache && user.value && !isVirtualChannel(routeStore, channel.value)) {
			pushViewToGrid();
		}

		if (routeTitle.value) {
			setCommunityMeta(community.value, routeTitle.value);
		}
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer>
		<template #default>
			<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
				<template v-if="channel === allChannel">
					{{ $gettext(`All Posts`) }}
				</template>
				<template v-else>{{ channel.displayTitle }}</template>
				<small v-if="Screen.isDesktop">{{ ' ' }} in {{ community.name }}</small>
			</h1>

			<div v-if="channel.visibility === 'draft'">
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
				:community="community"
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
