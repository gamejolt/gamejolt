<script lang="ts">
import { Ref, computed, ref, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import {
createAppRoute,
defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunitySidebar from '../../../../components/community/sidebar/AppCommunitySidebar.vue';
import { useGridStore } from '../../../../components/grid/grid-store';
import { useAppStore } from '../../../../store/index';
import AppCommunitiesViewFeed from '../_feed/AppCommunitiesViewFeed.vue';
import { doFeedChannelPayload, resolveFeedChannelPayload } from '../_feed/feed-helpers';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { CommunitiesViewChannelDeps } from '../channel/RouteCommunitiesViewChannel.vue';
import {
acceptCollaboration,
declineCollaboration,
setCommunityMeta,
useCommunityRouteStore,
} from '../view.store';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: CommunitiesViewChannelDeps,
		resolver: ({ route }) => doFeedChannelPayload(route),
	}),
};
</script>

<script lang="ts" setup>
const { communityStates, joinCommunity } = useAppStore();
const { user } = useCommonStore();
const { grid } = useGridStore();
const routeStore = useCommunityRouteStore()!;
const route = useRoute();
const router = useRouter();

const isBootstrapped = ref(false);
const feed = ref(null) as Ref<ActivityFeedView | null>;
const finishedLoading = ref(false);

const community = toRef(() => routeStore.community);
const communityState = toRef(() => communityStates.value.getCommunityState(community.value));
const sidebarData = toRef(() => routeStore.sidebarData!);

const collaboratorInvite = toRef(() => {
	// Just return the collaborator as an "invite" if it's not accepted yet.
	const { collaborator } = routeStore;
	return collaborator && !collaborator.isAccepted ? collaborator : null;
});

const canAcceptCollaboration = toRef(
	() => community.value.is_member || (user.value && user.value.can_join_communities)
);

const routeTitle = computed(() => {
	if (!community.value) {
		return null;
	}

	return $gettext(`%{ name } Community - Fan art, videos, guides, polls and more`, {
		name: community.value.name,
	});
});

const acceptCollaborationTooltip = computed(() =>
	canAcceptCollaboration.value ? '' : $gettext(`You are in too many communities.`)
);

watch(
	() => communityState.value.hasUnreadFeaturedPosts,
	() => {
		if (
			feed.value &&
			feed.value.newCount === 0 &&
			communityState.value.hasUnreadFeaturedPosts
		) {
			feed.value.newCount = 1;
		}
	},
	{ immediate: true }
);

function loadedNew() {
	if (communityState.value.hasUnreadFeaturedPosts && user.value) {
		grid.value?.pushViewNotifications('community-featured', {
			communityId: community.value.id,
		});
	}
}

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute: appRoute,
		route: route,
		router: router,
	});
}

async function receiveCollaboration() {
	if (!user.value) {
		return;
	}

	await acceptCollaboration(routeStore, user.value);
	joinCommunity(community.value, { grid: grid.value });
	showSuccessGrowl($gettext(`You are now a collaborator on this community!`));
}

async function rejectCollaboration() {
	await declineCollaboration(routeStore);
}

const appRoute = createAppRoute({
	routeTitle,
	onInit: () => {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
		finishedLoading.value = false;
	},
	onResolved({ payload, fromCache }) {
		feed.value = resolveFeedChannelPayload(
			feed.value,
			community.value,
			route,
			payload,
			fromCache
		);

		finishedLoading.value = true;

		if (routeTitle.value) {
			setCommunityMeta(community.value, routeTitle.value);
		}

		if (!fromCache && user.value) {
			grid.value?.pushViewNotifications('community-featured', {
				communityId: community.value.id,
			});
		}
	},
});
</script>

<template>
	<div>
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p>
					<b>
						{{ $gettext(`You've been invited to collaborate on this community.`) }}
					</b>
				</p>
				<AppButton
					v-app-tooltip.bottom="acceptCollaborationTooltip"
					solid
					:disabled="!canAcceptCollaboration"
					@click="receiveCollaboration()"
				>
					{{ $gettext(`Accept`) }}
				</AppButton>
				<AppButton solid @click="rejectCollaboration()">
					{{ $gettext(`Decline`) }}
				</AppButton>
			</div>
		</section>

		<AppCommunitiesViewPageContainer>
			<template #default>
				<AppCommunitiesViewFeed
					:feed="feed"
					@add-post="onPostAdded"
					@load-new="loadedNew"
				/>
			</template>
			<template #sidebar>
				<AppCommunitySidebar :sidebar-data="sidebarData" :community="community" />
			</template>
		</AppCommunitiesViewPageContainer>
	</div>
</template>
