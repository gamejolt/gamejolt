<script lang="ts">
import { computed, inject, ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { illNoComments } from '../../img/ill/illustrations';
import { RouteActivityFeedController } from './feed.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/placeholder/placeholder.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { AppActivityFeedLazy } from '../../components/lazy';
import AppButton from '../../../_common/button/AppButton.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, '/web/posts/for-you')),
	}),
};
</script>

<script lang="ts" setup>
const controller = inject<RouteActivityFeedController>('route-activity-feed')!;

const isBootstrapped = ref(false);

const feed = computed(() => controller.feed);

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
				name: 'fyp',
				url: `/web/posts/for-you`,
				shouldShowFollow: true,
				shouldShowDates: false,
				itemsPerPage: payload.perPage,
				suppressTicks: payload.suppressTicks,
			},
			payload.items,
			fromCache
		);
	},
});
</script>

<template>
	<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
	<div v-else>
		<div v-if="!feed.hasItems">
			<AppIllustration :src="illNoComments">
				<AppTranslate>
					You need to join some active communities for us to know your tastes.
				</AppTranslate>
			</AppIllustration>

			<AppSpacer vertical :scale="10" />

			<router-link
				v-app-track-event="`activity:main-menu:fyp-discover`"
				:to="{
					name: 'discover.communities',
				}"
			>
				<AppButton icon="compass-needle" solid lg block>
					<AppTranslate>Browse Communities</AppTranslate>
				</AppButton>
			</router-link>
		</div>
		<AppActivityFeedLazy v-else :feed="feed" />
	</div>
</template>
