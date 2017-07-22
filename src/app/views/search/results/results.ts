import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./results.html';

import { Search } from '../../../components/search/search-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
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

	Search = makeObservableService(Search);
	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Search.search(route.query.q);
	}

	routed() {
		this.$emit('searchpayload', this.$payload);
	}
}
