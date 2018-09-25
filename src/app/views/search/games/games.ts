import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./games.html';

import { Search } from '../../../components/search/search-service';
import { AppGameGrid } from '../../../components/game/grid/grid';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteSearchGames',
	components: {
		AppGameGrid,
	},
})
export default class RouteSearchGames extends BaseRouteComponent {
	@Prop(Object) payload!: any;

	readonly Search = Search;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: Route) {
		return Search.search(route.query.q, {
			type: 'game',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed($payload: any) {
		this.$emit('searchpayload', $payload);
	}
}
