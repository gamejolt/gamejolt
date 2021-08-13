import { Options } from 'vue-property-decorator';
import AppCommunityCard from '../../../../_common/community/card/card.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Search, sendSearch } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@Options({
	name: 'RouteSearchCommunities',
	components: {
		AppCommunityCard,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		sendSearch(route.query.q as string, {
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
}
