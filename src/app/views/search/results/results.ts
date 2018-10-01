import View from '!view!./results.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppGameGrid } from '../../../components/game/grid/grid';
import { Search } from '../../../components/search/search-service';

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
	@Prop(Object)
	payload!: any;

	@Prop(String)
	query!: string;

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
