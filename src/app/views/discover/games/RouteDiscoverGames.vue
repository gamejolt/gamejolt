<script lang="ts">
import { Options } from 'vue-property-decorator';
import { setAppPromotionCohort, useAppPromotionStore } from '../../../../_common/mobile-app/store';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { shallowSetup } from '../../../../utils/vue';

@Options({
	name: 'RouteDiscoverGames',
})
@OptionsForLegacyRoute()
export default class RouteDiscoverGames extends LegacyRouteComponent {
	appPromotionStore = shallowSetup(() => useAppPromotionStore());

	/**
	 * Because game listings reuse the component with different route names, it
	 * won't trigger the "created" hook again for the actual components, causing
	 * the route to never get resolved. This is a hack to fix that by updating
	 * the key to re-compile the component when it changes.
	 */
	get isGameListing() {
		return String(this.$route.name).startsWith('discover.games.list.');
	}

	routeCreated() {
		setAppPromotionCohort(this.appPromotionStore, 'store');
	}
}
</script>

<template>
	<router-view v-if="isGameListing" :key="$route.name" />
	<router-view v-else />
</template>
