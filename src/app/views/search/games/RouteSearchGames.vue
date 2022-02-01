<script lang="ts">
import { getQuery } from '../../../../utils/router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';
import AppGameGrid from '../../../components/game/grid/grid.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		resolver: ({ route }) =>
			sendSearch(getQuery(route, 'q') ?? '', {
				type: 'game',
				page: route.query.page ? parseInt(getQuery(route, 'page')!, 10) : 1,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { processPayload, hasSearch, searchPayload } = useSearchRouteController()!;

createAppRoute({
	onResolved({ payload }) {
		processPayload({ payload });
	},
});
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
