<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import AppUserCard from '../../../../_common/user/card/card.vue';
import { Search, sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../search.vue';

@Options({
	name: 'RouteSearchUsers',
	components: {
		AppUserCard,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		sendSearch(route.query.q as string, {
			type: 'user',
			page: route.query.page ? parseInt(route.query.page as string, 10) : 1,
		}),
})
export default class RouteSearchUsers extends BaseRouteComponent {
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
