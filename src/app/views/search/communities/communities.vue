<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Search, sendSearch } from '../../../components/search/search-service';
import { useSearchRouteController } from '../search.vue';

@Options({
	name: 'RouteSearchCommunities',
	components: {
		AppCommunityCard,
	},
})
@OptionsForRoute({
	cache: true,
	resolver: ({ route }) =>
		sendSearch(route.query.q as string, {
			type: 'community',
			page: route.query.page ? parseInt(route.query.page as string, 10) : 1,
		}),
})
export default class RouteSearchCommunities extends BaseRouteComponent {
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
					v-for="community of searchPayload.communities"
					:key="community.id"
					class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
				>
					<AppCommunityCard :community="community" track-goto elevate />
				</div>
			</div>
		</div>
	</section>
</template>
