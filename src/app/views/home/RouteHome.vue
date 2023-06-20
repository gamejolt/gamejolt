<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';
import { router } from '..';
import { Api } from '../../../_common/api/api.service';
import { showSuccessGrowl } from '../../../_common/growls/growls.service';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '../../../_common/route/route-component';
import { useCommonStore } from '../../../_common/store/common-store';
import { $gettextInterpolate } from '../../../_common/translate/translate.service';
import { User } from '../../../_common/user/user.model';
import { objectOmit } from '../../../utils/object';
import { IntentService } from '../../components/intent/intent.service';
import { RealmPathHistoryStateKey } from './feed-switcher/AppHomeFeedSwitcher.vue';
import { HomeFeedService } from './home-feed.service';

const RouteHomeFeed = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteHomeFeed.vue'))
);
const RouteDiscoverHome = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('../discover/home/RouteDiscoverHome.vue'))
);

/**
 * Returns the current analytics path we have assigned.
 */
export function getCurrentHomeRouteAnalyticsPath(route: RouteLocationNormalized) {
	const path = route.meta.analyticsPath;
	if (path && typeof path === 'string') {
		return path;
	}
	return undefined;
}

/**
 * Returns the analytics path we should assign to the route.
 */
export function getNewHomeRouteAnalyticsPath(route: RouteLocationNormalized, user: User | null) {
	// The route content, but not the path, changes depending on the user state
	// - so we need to track the page view through a analyticsPath meta value
	// that aligns with our route content.
	let analyticsPath = '/discover';
	if (user) {
		const tab = route.params?.tab;
		if (tab === HomeFeedService.fypTab) {
			analyticsPath = '/fyp';
		} else if (tab === HomeFeedService.activityTab) {
			analyticsPath = '/'; // For clarification purposes that "activity" => "/".
		} else {
			const realmPath = router.options.history.state[RealmPathHistoryStateKey];

			if (typeof realmPath === 'string' && realmPath.length) {
				analyticsPath = `/realm-${realmPath}`;
			} else {
				analyticsPath = '/';
			}
		}
	}
	return analyticsPath;
}

export function updateHomeRouteAnalyticsPath(route: RouteLocationNormalized, user: User | null) {
	route.meta.analyticsPath = getNewHomeRouteAnalyticsPath(route, user);
}

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
	onInit() {
		const query = router.currentRoute.value.query;
		const mtxProduct = query['mtx-product'];
		const mtxType = Array.isArray(mtxProduct) ? mtxProduct[0] : mtxProduct;
		if (!mtxType) {
			return;
		}

		router.replace({
			...router.currentRoute.value,
			query: objectOmit(query, ['mtx-product']),
		});

		const type = mtxType[0].toUpperCase() + mtxType.substring(1);
		const lastChar = type[type.length - 1].toLowerCase();

		let message = `%{ type } was added to your account.`;
		if (lastChar === 'x' || lastChar === 's') {
			message = `%{ type } were added to your account.`;
		}

		showSuccessGrowl($gettextInterpolate(message, { type }));
	},
	onResolved() {
		updateHomeRouteAnalyticsPath(route, user.value);
	},
});
</script>

<template>
	<div v-if="!userBootstrapped" />
	<RouteHomeFeed v-else-if="user" />
	<RouteDiscoverHome v-else />
</template>
