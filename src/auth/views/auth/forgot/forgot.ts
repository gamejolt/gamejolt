import { Component } from 'vue-property-decorator';
import * as View from '!view!./forgot.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FormRetrieveLogin } from '../../../components/forms/retrieve-login/retrieve-login';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		FormRetrieveLogin,
	},
})
export default class RouteAuthForgot extends BaseRouteComponent {
	routeInit() {
		Meta.title = this.$gettext('auth.forgot.page_title');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
}
