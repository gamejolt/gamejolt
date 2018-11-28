import View from '!view!./users.html';
import { AppUserCard } from 'game-jolt-frontend-lib/components/user/card/card';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Search } from '../../../components/search/search-service';
import { RouteStore, routeStore, RouteStoreModule } from '../search.store';

@View
@Component({
	name: 'RouteSearchUsers',
	components: {
		AppUserCard,
	},
})
@RouteResolver({
	cache: true,
	resolver: ({ route }) =>
		Search.search(route.query.q, {
			type: 'user',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		}),
	resolveStore({ route, payload }) {
		routeStore.commit('processPayload', { payload: payload, route: route });
	},
})
export default class RouteSearchUsers extends BaseRouteComponent {
	@RouteStoreModule.Mutation
	processPayload!: RouteStore['processPayload'];

	@RouteStoreModule.State
	hasSearch!: RouteStore['hasSearch'];

	@RouteStoreModule.State
	searchPayload!: RouteStore['searchPayload'];

	readonly Search = Search;
}
