<script lang="ts">
import { inject, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { configHomeDefaultFeed } from '../../../_common/config/config.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { useGridStore } from '../../components/grid/grid-store';
import { AppActivityFeedLazy } from '../../components/lazy';
import { illNoComments } from '../../img/ill/illustrations';
import { useAppStore } from '../../store/index';
import { HOME_FEED_ACTIVITY } from './home-feed.service';
import { RouteActivityFeedController } from './RouteHomeFeed.vue';

function getFetchUrl() {
	let url = '/web/dash/activity/activity';
	// If our home feed is not the activity feed, we only want to include the actual followed content in the feed.
	if (configHomeDefaultFeed.value !== HOME_FEED_ACTIVITY) {
		url += '?only-followed=1';
	}
	return url;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, getFetchUrl())),
	}),
};
</script>

<script lang="ts" setup>
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
				<AppTranslate>You don't have any activity yet.</AppTranslate>
				<br />
				<AppTranslate>Follow your friends, creators, and communities!</AppTranslate>
			</AppIllustration>

			<AppSpacer vertical :scale="10" />

			<RouterLink
				v-app-track-event="`activity:main-menu:discover`"
				:to="{
					name: 'discover.home',
				}"
			>
				<AppButton icon="compass-needle" solid lg block>
					<AppTranslate>Discover</AppTranslate>
				</AppButton>
			</RouterLink>
		</div>
		<AppActivityFeedLazy v-else :feed="feed" show-ads @load-new="onLoadedNew" />
	</div>
</template>
