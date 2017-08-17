import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./authorize.html';

import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthAuthorize',
})
export default class RouteAuthAuthorize extends BaseRouteComponent {
	isSuccess = false;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		const { userId, code, type } = route.params;
		return Api.sendRequest(`/web/auth/authorize/${userId}/${code}/${type}`);
	}

	get routeTitle() {
		if (this.isSuccess) {
			return this.$gettext('Redirecting...');
		}

		return this.$gettext('auth.authorize.invalid.page_title');
	}

	routed() {
		this.isSuccess = this.$payload.success;

		// Redirect them to their dashboard after a bit.
		if (this.isSuccess) {
			setTimeout(() => Auth.redirectDashboard(), 3000);
		}
	}
}
