import { h } from 'vue';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import {
	authOnJoin,
	authOnLogin,
	redirectToDashboard,
	redirectToOnboarding,
} from '../../../../../../_common/auth/auth.service';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

@Options({
	name: 'RouteAuthLinkedAccountFacebookCallback',
})
@OptionsForRoute({
	lazy: true,
	resolver({ route }) {
		const { code, state } = route.query;
		return Api.sendRequest(
			'/web/auth/linked-accounts/link_callback/facebook?code=' + code + '&state=' + state,
			{}
		);
	},
})
export default class RouteAuthLinkedAccountFacebookCallback extends BaseRouteComponent {
	routeResolved($payload: any) {
		if (!$payload.success) {
			if ($payload.reason && $payload.reason === 'no-email') {
				showErrorGrowl({
					sticky: true,
					message: this.$gettext(
						`Your Facebook account did not return an email address. Make sure you have verified it with Facebook.`
					),
				});
			} else if ($payload.reason && $payload.reason === 'duplicate-email') {
				showErrorGrowl({
					sticky: true,
					message: this.$gettext(
						`The email address on this Facebook account is already in use. Perhaps you already have an account?`
					),
				});
			} else if ($payload.reason && $payload.reason === 'no-unique-username') {
				showErrorGrowl({
					sticky: true,
					message: this.$gettext(
						`Could not create a username for your account. Perhaps you already have an account?`
					),
				});
			} else {
				showErrorGrowl({
					sticky: true,
					title: this.$gettext('Login Failed'),
					message: this.$gettext('Unable to log in with Facebook.'),
				});
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		if ($payload.accountCreated) {
			authOnJoin('facebook');
			redirectToOnboarding();
			return;
		}

		authOnLogin('facebook');
		redirectToDashboard();
	}

	render() {
		return h(AuthLinkedAccountProcessing);
	}
}
