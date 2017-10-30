import { Component } from 'vue-property-decorator';
import View from '!view!./forgot.html';

import { FormRetrieveLogin } from '../../../components/forms/retrieve-login/retrieve-login';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthForgot',
	components: {
		FormRetrieveLogin,
	},
})
export default class RouteAuthForgot extends BaseRouteComponent {
	get routeTitle() {
		return this.$gettext('auth.forgot.page_title');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
}
