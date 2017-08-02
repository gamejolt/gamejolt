import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./reset-password.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FormResetPassword } from '../../../components/forms/reset-password/reset-password';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthResetPassword',
	components: {
		FormResetPassword,
	},
})
export default class RouteAuthResetPassword extends BaseRouteComponent {
	@Prop(String) userId: string;
	@Prop(String) token: string;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		// Will return a 404 if the key isn't correct for this user.
		return Api.sendRequest('/web/auth/check-reset-key/' + route.params.userId, {
			key: route.params.token,
		});
	}

	routeInit() {
		Meta.title = this.$gettext('auth.reset_password.page_title');
	}

	onSubmitted() {
		Growls.success(
			this.$gettext('auth.reset_password.success_growl'),
			this.$gettext('auth.reset_password.success_growl_title')
		);
		this.$router.push({ name: 'auth.login' });
	}
}
