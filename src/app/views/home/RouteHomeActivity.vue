<script lang="ts" setup>
import { inject, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { useGridStore } from '~app/components/grid/grid-store';
import { AppActivityFeedLazy } from '~app/components/lazy';
import { useAppStore } from '~app/store/index';
import { routeDiscoverHome } from '~app/views/discover/home/home.route';
import { shouldUseFYPDefault } from '~app/views/home/home-feed.service';
import { RouteActivityFeedController } from '~app/views/home/RouteHomeFeed.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoComments } from '~common/illustration/illustrations';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppSpacer from '~common/spacer/AppSpacer.vue';

defineOptions(
	defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'never',
		resolver: ({ route }) => {
			let url = '/web/dash/activity/activity';

			// If our home feed is not the activity feed, we only want to
			// include the actual followed content in the feed.
			if (shouldUseFYPDefault()) {
				url += '?only-followed=1';
			}

			return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, url));
		},
	})
);

const { unreadActivityCount } = useAppStore();
const { grid } = useGridStore();
const { feed } = inject<RouteActivityFeedController>('route-activity-feed')!;

const isBootstrapped = ref(false);

watch(
	unreadActivityCount,
	count => {
		if (feed.value && count > feed.value.newCount) {
			feed.value.newCount = count;
		}
	},
	{ immediate: true }
);

createAppRoute({
	onInit() {
		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'activity',
				url: `/web/dash/activity/more/activity`,
				shouldShowFollow: true,
				notificationWatermark: payload.unreadWatermark,
				itemsPerPage: payload.perPage,
			},
			payload.items,
			fromCache
		);

		if (!fromCache) {
			grid.value?.pushViewNotifications('activity');
		}
	},
});

function onLoadedNew() {
	if (unreadActivityCount.value > 0) {
		grid.value?.pushViewNotifications('activity');
	}
}
</script>

<template>
	<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
	<div v-else>
		<div v-if="!feed.hasItems">
			<AppIllustration :asset="illNoComments">
				{{ $gettext(`You don't have any activity yet.`) }}
				<br />
				{{ $gettext(`Follow people to see their posts here!`) }}
			</AppIllustration>

			<AppSpacer vertical :scale="10" />

			<RouterLink
				:to="{
					name: routeDiscoverHome.name,
				}"
			>
				<AppButton icon="compass-needle" solid lg block>
					{{ $gettext(`Discover`) }}
				</AppButton>
			</RouterLink>
		</div>
		<AppActivityFeedLazy v-else :feed="feed" show-ads @load-new="onLoadedNew" />
	</div>
</template>
