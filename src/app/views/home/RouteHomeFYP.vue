<script lang="ts">
import { inject, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { configFYPExperiment } from '../../../_common/config/config.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { illNoComments } from '../../../_common/illustration/illustrations';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppActivityFeedPlaceholder from '../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { AppActivityFeedLazy } from '../../components/lazy';
import { routeDiscoverHome } from '../discover/home/home.route';
import { RouteActivityFeedController } from './RouteHomeFeed.vue';

function _feedUrl() {
	return `/web/posts/for-you?exp-fyp=${configFYPExperiment.value}`;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'always',
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
