import View from '!view!./reset-password.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { FormResetPassword } from '../../../components/forms/reset-password/reset-password';

@View
@Component({
	name: 'RouteAuthResetPassword',
	components: {
		FormResetPassword,
	},
})
@RouteResolver({
	// Will return a 404 if the key isn't correct for this user.
	resolver: ({ route }) =>
		Api.sendRequest('/web/auth/check-reset-key/' + route.params.userId, {
			key: route.params.token,
		}),
})
export default class RouteAuthResetPassword extends BaseRouteComponent {
	get userId() {
		return parseInt(this.$route.params.userId, 10);
	}

	get token() {
		return this.$route.params.token;
	}

	get routeTitle() {
		return this.$gettext('auth.reset_password.page_title');
	}

	onSubmitted() {
		Growls.success(
			this.$gettext('auth.reset_password.success_growl'),
			this.$gettext('auth.reset_password.success_growl_title')
		);
		this.$router.push({ name: 'auth.login' });
	}
}
