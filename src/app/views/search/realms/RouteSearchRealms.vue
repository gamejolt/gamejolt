<script lang="ts">
import { computed } from 'vue';
import AppRealmFullCard from '../../../../_common/realm/AppRealmFullCard.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { getQuery } from '../../../../utils/router';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';

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
const { processPayload, hasSearch, searchPayload, query } = useSearchRouteController()!;

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`"%{ query }" realms`, {
			query: query.value,
		})
	),
	onResolved({ payload }) {
		processPayload({ payload });
	},
});
</script>

<template>
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
</template>

<style lang="stylus" scoped>
.-grid
	--grid-col: 4
	display: grid
	grid-template-columns: repeat(var(--grid-col), minmax(0, 1fr))
	gap: 24px
	padding: 0 ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		padding: 0 ($grid-gutter-width / 2)

	@media $media-sm
		--grid-col: 3

	@media $media-xs
		--grid-col: 2
		gap: 16px
</style>
