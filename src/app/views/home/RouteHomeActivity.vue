<script lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { useAppStore } from '../../store/index';
import { RouteActivityFeedController } from './feed.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import { illNoComments } from '../../img/ill/illustrations';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import { RouterLink } from 'vue-router';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppButton from '../../../_common/button/AppButton.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/dash/activity/activity')),
	}),
};
</script>

<script lang="ts" setup>
const { grid, unreadActivityCount } = useAppStore();
const controller = inject<RouteActivityFeedController>('route-activity-feed')!;

const isBootstrapped = ref(false);

const feed = computed(() => controller.feed);

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
		controller.feed = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;

		controller.feed = ActivityFeedService.routed(
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
			<AppIllustration :src="illNoComments">
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
					<AppTranslate>Explore</AppTranslate>
				</AppButton>
			</RouterLink>
		</div>
		<AppActivityFeedLazy v-else :feed="feed" @load-new="onLoadedNew" />
	</div>
</template>
