<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
import { getQuery } from '../../../../utils/router';
import { sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../RouteSearch.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		resolver: ({ route }) =>
			sendSearch(getQuery(route, 'q') ?? '', {
				type: 'user',
				page: route.query.page ? parseInt(getQuery(route, 'page')!, 10) : 1,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { processPayload, hasSearch, searchPayload, query } = useSearchRouteController()!;

createAppRoute({
	routeTitle: computed(() =>
		$gettext(`Users matching "%{ query }"`, {
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
			<div
				v-for="user of searchPayload.users"
				:key="user.id"
				class="-item col-sm-6 col-md-4 col-lg-3"
			>
				<AppUserCard :user="user" elevate />
			</div>
		</div>
	</div>
</template>
