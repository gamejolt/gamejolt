import View from '!view!./change-password.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormChangePassword } from '../../../../components/forms/change-password/change-password';
import { RouteMutation, RouteStore } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	@RouteMutation
	setHeading!: RouteStore['setHeading'];

	hasPassword = true;

	get routeTitle() {
		return this.$gettext(`dash.change_pass.page_title`);
	}

	@RouteResolve({
		deps: {},
	})
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
