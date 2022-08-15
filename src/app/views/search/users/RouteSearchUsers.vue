<script lang="ts">
import { getQuery } from '../../../../utils/router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppUserCard from '../../../../_common/user/card/AppUserCard.vue';
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
				<div
					v-for="user of searchPayload.users"
					:key="user.id"
					class="-item col-sm-6 col-md-4 col-lg-3"
				>
					<AppUserCard :user="user" elevate />
				</div>
			</div>
		</div>
	</section>
</template>
