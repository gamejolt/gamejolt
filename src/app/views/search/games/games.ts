import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./games.html';

import { Search } from '../../../components/search/search-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
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
	@Prop(Object) payload: any;

	Search = makeObservableService(Search);

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Search.search(route.query.q, {
			type: 'game',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed() {
		this.$emit('searchpayload', this.$payload);
	}
}
