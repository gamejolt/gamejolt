import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./users.html';

import { Search } from '../../../components/search/search-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteSearchUsers',
	components: {
		AppUserAvatar,
		AppPagination,
	},
})
export default class RouteSearchUsers extends BaseRouteComponent {
	@Prop(Object) payload: any;

	Search = makeObservableService(Search);
	Scroll = Scroll;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Search.search(route.query.q, {
			type: 'user',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed() {
		this.$emit('searchpayload', this.$payload);
	}
}
