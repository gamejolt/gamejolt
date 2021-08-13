import { Options } from 'vue-property-decorator';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import AppGameGrid from '../../../components/game/grid/grid.vue';
import { Search, sendSearch } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@Options({
	name: 'RouteSearchGames',
	components: {
		AppGameGrid,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		sendSearch(route.query.q as string, {
			type: 'game',
			page: route.query.page ? parseInt(route.query.page as string, 10) : 1,
		}),
	resolveStore({ route, payload }) {
		routeStore.commit('processPayload', { payload: payload, route: route });
	},
})
export default class RouteSearchGames extends BaseRouteComponent {
	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Search = Search;
}
