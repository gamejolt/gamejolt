<script lang="ts">
export default {
	...defineAppRouteOptions({
		cache: true,
		resolver: ({ route }) =>
			sendSearch(getQuery(route, 'q') ?? '', {
				type: 'realms',
				page: route.query.page ? parseInt(getQuery(route, 'page')!, 10) : 1,
			}),
	}),
};
</script>

<script lang="ts" setup>
import { getQuery } from '../../../../utils/router';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';

const { processPayload, hasSearch, searchPayload } = useSearchRouteController()!;

createAppRoute({
	onResolved({ payload }) {
		processPayload({ payload });
	},
});
</script>

<template>
	<section class="section">
		<div v-if="hasSearch" class="container">
			<div class="row">
				<div class="-grid">
					<AppRealmFullCard
						v-for="realm of searchPayload.realms"
						:key="realm.id"
						:realm="realm"
						:to="realm.routeLocation"
						label-position="bottom-left"
						overlay-content
						no-sheet
						no-follow
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
.-grid
	--grid-col: 4
	display: grid
	grid-template-columns: repeat(var(--grid-col), minmax(0, 1fr))
	gap: 24px

	@media $media-sm
		--grid-col: 3

	@media $media-xs
		--grid-col: 2
		gap: 16px
</style>
