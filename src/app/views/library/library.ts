import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteLibrary',
})
export default class RouteLibrary extends BaseRouteComponent {
	@RouteResolve()
	async routeResolve() {
		// Make sure we await this so that the children know if we're logged in.
		await User.touch();
	}

	render(h: CreateElement) {
		return h('router-view');
	}
}
