<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { getQuery } from '../../../../utils/router';
import AppGameGrid from '../../../components/game/grid/AppGameGrid.vue';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: 'always',
		resolver: ({ route }) =>
			sendSearch(getQuery(route, 'q') ?? '', {
				type: 'game',
				page: route.query.page ? parseInt(getQuery(route, 'page')!, 10) : 1,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { processPayload, hasSearch, searchPayload, query } = useSearchRouteController()!;

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`"%{ query }" games`, {
			query: query.value,
		})
	),
	onResolved({ payload }) {
		processPayload({ payload });
	},
});
</script>

<template>
	<div v-if="hasSearch" class="container-xl">
		<AppGameGrid
			:games="searchPayload.games"
			:games-count="searchPayload.gamesCount"
			:current-page="searchPayload.page"
			show-ads
			event-label="search-games"
		/>
	</div>
</template>
