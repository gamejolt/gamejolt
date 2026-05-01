<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { IntentService } from '~app/components/intent/intent.service';
import { HomeFeedService } from '~app/views/home/home-feed.service';
import { Api } from '~common/api/api.service';
import { showSuccessGrowl } from '~common/growls/growls.service';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { objectOmit } from '~utils/object';

const RouteHomeFeed = defineAsyncComponent(() =>
	asyncRouteLoader(import('~app/views/home/RouteHomeFeed.vue'))
);
const RouteDiscoverHome = defineAsyncComponent(() =>
	asyncRouteLoader(import('~app/views/discover/home/RouteDiscoverHome.vue'))
);

defineOptions({
	...defineAppRouteOptions({
		lazy: true,
		reloadOn: { query: IntentService.APPROVED_LOGIN_QUERY_PARAMS as [string, ...string[]] },
		resolver: async ({ route }) => {
			const intentRedirect = IntentService.checkApprovedLoginIntent(route);
			if (intentRedirect) {
				return intentRedirect;
			}

			return await Api.sendRequest('/web/touch');
		},
	}),
});

const { user, userBootstrapped } = useCommonStore();
const route = useRoute();
const router = useRouter();

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

		showSuccessGrowl($gettext(message, { type }));
	},
	onResolved() {
		// The route content, but not the path, changes depending on the user
		// state - so we need to track the page view through a analyticsPath
		// meta value that aligns with our route content.
		let analyticsPath = '/discover';
		if (user.value) {
			if (route.params?.tab === HomeFeedService.fypTab) {
				analyticsPath = '/fyp';
			} else if (route.params?.tab === HomeFeedService.activityTab) {
				analyticsPath = '/'; // For clarification purposes that "activity" => "/".
			} else {
				analyticsPath = '/';
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
