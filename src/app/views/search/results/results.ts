import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./results.html';

import { Search } from '../../../components/search/search-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteSearchResults',
	components: {
		AppUserAvatar,
		AppGameGrid,
		AppJolticon,
	},
	filters: {
		number,
	},
})
export default class RouteSearchResults extends BaseRouteComponent {
	@Prop(Object) payload: any;
	@Prop(String) query: string;

	readonly Search = Search;
	readonly Screen = Screen;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: Route) {
		return Search.search(route.query.q);
	}

	routed($payload: any) {
		this.$emit('searchpayload', $payload);
	}
}
