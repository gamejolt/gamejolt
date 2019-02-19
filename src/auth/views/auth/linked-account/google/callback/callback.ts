import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../../../lib/gj-lib-client/components/auth/auth.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { AuthLinkedAccountProcessing } from '../../_processing/processing';

@Component({
	name: 'RouteAuthLinkedAccountGoogleCallback',
})
@RouteResolver({
	resolver({ route }) {
		const { code, state } = route.query;
		return Api.sendRequest(
			'/web/auth/linked-accounts/link_callback/google?code=' + code + '&state=' + state,
			{}
		);
	},
})
export default class RouteAuthLinkedAccountGoogleCallback extends BaseRouteComponent {
	routeResolved($payload: any) {
		if (!$payload.success) {
			if ($payload.reason && $payload.reason === 'no-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(
						`Your Google+ account did not return an email address. Make sure you have verified it with Google.`
					),
				});
			} else if ($payload.reason && $payload.reason === 'duplicate-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(
						`The email address on this Google+ account is already in use. Perhaps you already have an account?`
					),
				});
			} else if ($payload.reason && $payload.reason === 'no-unique-username') {
				Growls.error({
					sticky: true,
					message: this.$gettext(
						`Could not create a username for your account. Perhaps you already have an account?`
					),
				});
			} else {
				Growls.error({
					sticky: true,
					title: this.$gettext('Login Failed'),
					message: this.$gettext('Unable to log in with Google+.'),
				});
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		Auth.redirectNewUserFlow();
	}

	render(h: CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
