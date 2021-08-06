import { Component } from 'vue-property-decorator';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { configHasSearchCommunities } from '../../../../_common/config/config.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Search } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@Component({
	name: 'RouteSearchCommunities',
	components: {
		AppCommunityCard,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		Search.search(route.query.q as string, {
			type: 'community',
			page: route.query.page ? parseInt(route.query.page as string, 10) : 1,
		}),
	resolveStore({ route, payload }) {
		routeStore.commit('processPayload', { payload: payload, route: route });
	},
})
export default class RouteSearchCommunities extends BaseRouteComponent {
	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Search = Search;

	routeCreated() {
		trackExperimentEngagement(configHasSearchCommunities);
	}
}
