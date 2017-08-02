import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteLanding',
})
export default class RouteLanding extends BaseRouteComponent {
	@RouteResolve()
	routeResolve() {
		return User.touch();
	}

	render(h: Vue.CreateElement) {
		return h('router-view');
	}
}
