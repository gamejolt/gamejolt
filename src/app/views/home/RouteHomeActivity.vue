<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../_common/illustration/illustrations';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { SettingTwitterMoad } from '../../../_common/settings/settings.service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { useGridStore } from '../../components/grid/grid-store';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppTwitterMoad from '../../components/twitter-moad/AppTwitterMoad.vue';
import { useAppStore } from '../../store/index';
import { routeDiscoverHome } from '../discover/home/home.route';
import { RouteActivityFeedController } from './RouteHomeFeed.vue';
import { shouldUseFYPDefault } from './home-feed.service';

defineOptions(
	defineAppRouteOptions({
		cache: true,
		lazy: true,
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

const twitterMoad = computed(() => SettingTwitterMoad.get());

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
		<AppTwitterMoad v-if="twitterMoad" />
		<div v-else-if="!feed.hasItems">
			<AppIllustration :asset="illNoComments">
				{{ $gettext(`You don't have any activity yet.`) }}
				<br />
				{{ $gettext(`Follow people to see their posts here!`) }}
			</AppIllustration>

			<AppSpacer vertical :scale="10" />

			<RouterLink
				v-app-track-event="`activity:main-menu:discover`"
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
