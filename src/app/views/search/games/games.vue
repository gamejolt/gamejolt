<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import { Search, sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../search.vue';

@Options({
	name: 'RouteSearchGames',
	components: {
		AppGameGrid,
	},
})
@OptionsForRoute({
	cache: true,
	resolver: ({ route }) =>
		sendSearch(route.query.q as string, {
			type: 'game',
			page: route.query.page ? parseInt(route.query.page as string, 10) : 1,
		}),
})
export default class RouteSearchGames extends BaseRouteComponent {
	routeStore = setup(() => useSearchRouteController()!);

	readonly Search = Search;

	get hasSearch() {
		return this.routeStore.hasSearch;
	}

	get searchPayload() {
		return this.routeStore.searchPayload;
	}

	routeResolved(payload: any) {
		this.routeStore.processPayload({ payload, route: this.$route });
	}
}
</script>

<template>
	<section class="section">
		<div v-if="hasSearch" class="container-xl">
			<AppGameGrid
				:games="searchPayload.games"
				:games-count="searchPayload.gamesCount"
				:current-page="searchPayload.page"
				show-ads
				event-label="search-games"
			/>
		</div>
	</section>
</template>
