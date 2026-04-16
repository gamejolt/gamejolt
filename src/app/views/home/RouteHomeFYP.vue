<script lang="ts">
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';

import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { AppActivityFeedLazy } from '~app/components/lazy';
import { routeDiscoverHome } from '~app/views/discover/home/home.route';
import { RouteActivityFeedController } from '~app/views/home/RouteHomeFeed.vue';
import { trackExperimentEngagement } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { configFYPExperiment } from '~common/config/config.service';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoComments } from '~common/illustration/illustrations';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppSpacer from '~common/spacer/AppSpacer.vue';

function _feedUrl() {
	return `/web/posts/for-you?exp-fyp=${configFYPExperiment.value}`;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest(ActivityFeedService.makeFeedUrl(route, _feedUrl())),
	}),
};
</script>

<script lang="ts" setup>
const { feed } = inject<RouteActivityFeedController>('route-activity-feed')!;

const isBootstrapped = ref(false);

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
				name: 'fyp',
				url: _feedUrl(),
				shouldShowFollow: true,
				itemsPerPage: payload.perPage,
				suppressTicks: payload.suppressTicks,
			},
			payload.items,
			fromCache
		);

		trackExperimentEngagement(configFYPExperiment);
	},
});
</script>

<template>
	<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
	<div v-else>
		<div v-if="!feed.hasItems">
			<AppIllustration :asset="illNoComments">
				{{
					$gettext(
						`You need to join some realms, creators or friends for us to know your tastes.`
					)
				}}
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
		<AppActivityFeedLazy v-else :feed="feed" show-ads />
	</div>
</template>
