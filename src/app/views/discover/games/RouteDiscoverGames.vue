<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import {
	AppPromotionStore,
	AppPromotionStoreKey,
	setAppPromotionCohort,
} from '../../../../utils/mobile-app';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteDiscoverGames',
})
export default class RouteDiscoverGames extends BaseRouteComponent {
	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

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
		setAppPromotionCohort(this.appPromotion, 'store');
	}
}
</script>

<template>
	<router-view v-if="isGameListing" :key="$route.name" />
	<router-view v-else />
</template>
