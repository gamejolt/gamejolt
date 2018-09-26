import View from '!view!./users.html';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { Search } from '../../../components/search/search-service';

@View
@Component({
	name: 'RouteSearchUsers',
	components: {
		AppUserAvatar,
		AppPagination,
	},
})
export default class RouteSearchUsers extends BaseRouteComponent {
	@Prop(Object)
	payload!: any;

	readonly Search = Search;
	readonly Scroll = Scroll;

	@RouteResolve({ cache: true, reloadOnQueryChange: true })
	routeResolve(this: undefined, route: Route) {
		return Search.search(route.query.q, {
			type: 'user',
			page: route.query.page ? parseInt(route.query.page, 10) : 1,
		});
	}

	routed($payload: any) {
		this.$emit('searchpayload', $payload);
	}
}
