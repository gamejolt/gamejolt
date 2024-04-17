<script lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	...defineAppRouteOptions({
		deps: {},
	}),
};
</script>

<script lang="ts" setup>
const appPromotionStore = useAppPromotionStore();
const route = useRoute();

/**
 * Because game listings reuse the component with different route names, it
 * won't trigger the "created" hook again for the actual components, causing
 * the route to never get resolved. This is a hack to fix that by updating
 * the key to re-compile the component when it changes.
 */
const isGameListing = computed(() => String(route.name).startsWith('discover.games.list.'));

createAppRoute({
	onInit() {
		setAppPromotionCohort(appPromotionStore, 'store');
	},
});
</script>

<template>
	<RouterView v-if="isGameListing" :key="route.name" />
	<RouterView v-else />
</template>
