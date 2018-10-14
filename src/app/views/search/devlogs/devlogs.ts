import View from '!view!./devlogs.html';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { Search } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@View
@Component({
	name: 'RouteSearchDevlogs',
	components: {
		AppGameGrid,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		Search.search(route.query.q, {
			type: 'devlog',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		}),
	resolveStore({ route, payload }) {
		routeStore.commit('processPayload', { payload: payload, route: route });
	},
})
export default class RouteSearchDevlogs extends BaseRouteComponent {
	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Search = Search;
}
