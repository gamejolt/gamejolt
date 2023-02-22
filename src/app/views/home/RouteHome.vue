<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { router } from '..';
import { Api } from '../../../_common/api/api.service';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';
import { IntentService } from '../../components/intent/intent.service';
import { RealmPathHistoryStateKey } from './feed-switcher/AppHomeFeedSwitcher.vue';
import { HomeFeedService } from './home-feed.service';

const RouteHomeFeed = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeFeed.vue'))
);
const RouteDiscoverHome = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('../discover/home/RouteDiscoverHome.vue'))
);

export default {
	...defineAppRouteOptions({
		lazy: true,
		deps: { query: IntentService.APPROVED_LOGIN_QUERY_PARAMS },
		resolver: async ({ route }) => {
			const intentRedirect = IntentService.checkApprovedLoginIntent(route);
			if (intentRedirect) {
				return intentRedirect;
			}

			return await Api.sendRequest('/web/touch');
		},
	}),
};
</script>

<script lang="ts" setup>
const { user, userBootstrapped } = useCommonStore();
const route = useRoute();

createAppRoute({
	routeTitle: null,
	onResolved() {
		// The route content, but not the path, changes depending on the user
		// state - so we need to track the page view through a analyticsPath
		// meta value that aligns with our route content.
		let analyticsPath = '/discover';
		if (user.value) {
			const tab = route.params?.tab;
			if (tab === HomeFeedService.fypTab) {
				analyticsPath = '/fyp';
			} else if (tab === HomeFeedService.activityTab) {
				analyticsPath = '/'; // For clarification purposes that "activity" => "/".
			} else {
				const realmPath = router.options.history.state[RealmPathHistoryStateKey];

				if (typeof realmPath === 'string' && realmPath.length) {
					// TODO(home-realm-switcher): Analytics path
					analyticsPath = `/realm-${realmPath}`;
				} else {
					analyticsPath = '/';
				}
			}
		}

		route.meta.analyticsPath = analyticsPath;
	},
});
</script>

<template>
	<div v-if="!userBootstrapped" />
	<RouteHomeFeed v-else-if="user" />
	<RouteDiscoverHome v-else />
</template>
