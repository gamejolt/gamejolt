import View from '!view!./devlogs.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { Search } from '../../../components/search/search-service';

@View
@Component({
	name: 'RouteSearchDevlogs',
	components: {
		AppGameGrid,
	},
})
export default class RouteSearchDevlogs extends BaseRouteComponent {
	@Prop(Object)
	payload!: any;

	readonly Search = Search;

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
