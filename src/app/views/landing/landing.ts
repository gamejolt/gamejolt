import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@Component({
	name: 'RouteLanding',
})
export default class RouteLanding extends BaseRouteComponent {
	@RouteResolve({
		deps: {},
	})
	routeResolve() {
		return User.touch();
	}

	render(h: CreateElement) {
		return h('router-view');
	}
}
