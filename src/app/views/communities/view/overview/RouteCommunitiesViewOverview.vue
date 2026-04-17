<script lang="ts">
import { computed, Ref, ref, toRef, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import AppCommunitySidebar from '~app/components/community/sidebar/AppCommunitySidebar.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import { useAppStore } from '~app/store/index';
import AppCommunitiesViewFeed from '~app/views/communities/view/_feed/AppCommunitiesViewFeed.vue';
import {
	doFeedChannelPayload,
	resolveFeedChannelPayload,
} from '~app/views/communities/view/_feed/feed-helpers';
import AppCommunityPageContainer from '~app/views/communities/view/_page-container/AppCommunityPageContainer.vue';
import { CommunitiesViewChannelDeps } from '~app/views/communities/view/channel/RouteCommunitiesViewChannel.vue';
import {
	acceptCollaboration,
	declineCollaboration,
	setCommunityMeta,
	useCommunityRouteStore,
} from '~app/views/communities/view/view.store';
import AppButton from '~common/button/AppButton.vue';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
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

const collaboratorInvite = computed(() => {
	// Just return the collaborator as an "invite" if it's not accepted yet.
	const { collaborator } = routeStore;
	return collaborator && !collaborator.isAccepted ? collaborator : null;
});

const canAcceptCollaboration = computed(
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

watchEffect(() => {
	if (feed.value?.newCount === 0 && communityState.value.hasUnreadFeaturedPosts) {
		feed.value.newCount = 1;
	}
});

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
			<div class="gj-container text-center">
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

		<AppCommunityPageContainer>
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
		</AppCommunityPageContainer>
	</div>
</template>
