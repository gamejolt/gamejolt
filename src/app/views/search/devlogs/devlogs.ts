import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./devlogs.html';

import { Search } from '../../../components/search/search-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppGameGrid } from '../../../components/game/grid/grid';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteSearchDevlogs',
	components: {
		AppGameGrid,
	},
})
export default class RouteSearchDevlogs extends BaseRouteComponent {
	@Prop(Object) payload: any;

	Search = makeObservableService(Search);

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: Route) {
		return Search.search(route.query.q, {
			type: 'devlog',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed($payload: any) {
		this.$emit('searchpayload', $payload);
	}
}
