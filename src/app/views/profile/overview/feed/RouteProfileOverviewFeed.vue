<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouteLocationNormalized, RouterLink, useRoute, useRouter } from 'vue-router';

import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import { AppActivityFeedLazy } from '~app/components/lazy';
import AppPostAddButton from '~app/components/post/add-button/AppPostAddButton.vue';
import AppUserSpawnDay from '~app/components/user/spawn-day/AppUserSpawnDay.vue';
import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import AppAdTakeoverFloat from '~common/ad/AppAdTakeoverFloat.vue';
import { Api } from '~common/api/api.service';
import { EventItemModel } from '~common/event-item/event-item.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoComments } from '~common/illustration/illustrations';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

function checkIsLikeFeed(route: RouteLocationNormalized) {
	return route.params.feedSection === 'likes';
}

function getFetchUrl(route: RouteLocationNormalized) {
	const tab = route.query.tab || 'active';
	const feedType = checkIsLikeFeed(route) ? 'user-likes' : 'user';
	return `/web/posts/fetch/${feedType}/@${route.params.username}?tab=${tab}`;
}

export default {
	...defineAppRouteOptions({
		cache: false,
		lazy: true,
		reloadOn: { params: ['feedSection'], query: ['tab', 'feed_last_id'] },
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl(route)), undefined, {
				// Don't error redirect here. It would go to 404 if the user is banned, and prevent us
				// from showing the "This user is banned" page.
				noErrorRedirect: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useProfileRouteStore()!;
const { user: sessionUser } = useCommonStore();
const route = useRoute();
const router = useRouter();

const feed = ref(null) as Ref<ActivityFeedView | null>;
const isBootstrapped = ref(false);

const tab = computed(() => {
	if (route.params.feedSection === 'likes') {
		return 'likes';
	}
	return route.query.tab || 'active';
});

const isOwner = computed(() => sessionUser.value && user.value?.id === sessionUser.value.id);
const isLikeFeed = computed(() => checkIsLikeFeed(route));
const isLikeFeedDisabled = computed(() => user.value?.liked_posts_enabled === false);

const likeFeedTooltip = computed(() => {
	if (!isLikeFeedDisabled.value) {
		return null;
	}

	return isOwner.value
		? $gettext(`You've made your liked posts private, so only you can see this.`)
		: $gettext(`This user has made their liked posts private.`);
});

const appRoute = createAppRoute({
	routeTitle: computed(() => {
		if (user.value) {
			return `${user.value.display_name} (@${user.value.username})`;
		}
		return null;
	}),
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'user-profile',
				url: getFetchUrl(route),
				itemsPerPage: payload.perPage,
				shouldShowFollow: isLikeFeed.value,
			},
			payload.items,
			fromCache
		);
	},
});

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute,
		route,
		router,
	});
}

function onPostEdited(eventItem: EventItemModel) {
	ActivityFeedService.onPostEdited({
		eventItem,
		appRoute,
		route,
		router,
	});
}

function onPostPublished(eventItem: EventItemModel) {
	ActivityFeedService.onPostPublished({
		eventItem,
		appRoute,
		route,
		router,
	});
}
</script>

<template>
	<AppAdTakeoverFloat>
		<!-- Spawn day -->
		<AppUserSpawnDay :user="user!" @post-add="onPostAdded" />

		<AppPostAddButton v-if="isOwner" @add="onPostAdded" />

		<AppNavTabList>
			<ul>
				<li>
					<RouterLink
						:to="{
							name: 'profile.overview',
							query: {},
						}"
						:class="{
							active: tab === 'active',
						}"
					>
						{{ $gettext(`Posts`) }}
					</RouterLink>
				</li>
				<li v-app-tooltip="likeFeedTooltip">
					<RouterLink
						:to="{
							name: 'profile.overview',
							query: {},
							params: { feedSection: 'likes' },
						}"
						:class="{
							active: tab === 'likes',
						}"
					>
						{{ $gettext(`Likes`) }}
						<AppJolticon v-if="isLikeFeedDisabled" icon="subscribed" />
					</RouterLink>
				</li>
				<template v-if="isOwner">
					<li>
						<RouterLink
							:to="{
								name: 'profile.overview',
								query: {
									tab: 'draft',
								},
							}"
							:class="{
								active: tab === 'draft',
							}"
						>
							{{ $gettext(`Draft posts`) }}
						</RouterLink>
					</li>
					<li>
						<RouterLink
							:to="{
								name: 'profile.overview',
								query: {
									tab: 'scheduled',
								},
							}"
							:class="{
								active: tab === 'scheduled',
							}"
						>
							{{ $gettext(`Scheduled posts`) }}
						</RouterLink>
					</li>
				</template>
			</ul>
		</AppNavTabList>

		<AppIllustration v-if="isLikeFeed && isLikeFeedDisabled && !isOwner" :asset="illNoComments">
			<p>
				{{ $gettext(`This user has made their liked posts private.`) }}
			</p>
		</AppIllustration>
		<AppActivityFeedPlaceholder v-else-if="!feed || !feed.isBootstrapped" />
		<template v-else>
			<AppActivityFeedLazy
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@edit-post="onPostEdited"
				@publish-post="onPostPublished"
			/>
			<AppIllustration v-else :asset="illNoComments">
				<p>
					<template v-if="isOwner">
						<template v-if="isLikeFeed">
							{{ $gettext(`You haven't liked anything yet.`) }}
						</template>
						<template v-else>
							{{ $gettext(`You haven't posted anything yet.`) }}
						</template>
					</template>
					<template v-else>
						<template v-if="isLikeFeed">
							{{ $gettext(`This user hasn't liked anything yet.`) }}
						</template>
						<template v-else>
							{{ $gettext(`This user hasn't posted anything yet.`) }}
						</template>
					</template>
				</p>
			</AppIllustration>
		</template>
	</AppAdTakeoverFloat>
</template>
