import { Component } from 'vue-property-decorator';
import View from '!view!./change-password.html';

import { RouteMutation, RouteStore } from '../account.store';
import { FormChangePassword } from '../../../../components/forms/change-password/change-password';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Route } from 'vue-router';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	hasPassword = true;

	get routeTitle() {
		return this.$gettext(`dash.change_pass.page_title`);
	}

	@RouteResolve()
	routeResolve(this: undefined, _route: Route) {
		return Api.sendRequest('/web/dash/account/has_password');
	}

	routeInit() {
		this.setHeading(this.$gettext('dash.change_pass.heading'));
	}

	routed($payload: any) {
		this.hasPassword = $payload.hasPassword;
	}
}
