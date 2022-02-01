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
	name: 'RouteAuthLinkedAccountGoogleCallback',
})
@OptionsForRoute({
	lazy: true,
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
			switch ($payload.reason) {
				case 'no-email':
					showErrorGrowl({
						sticky: true,
						message: this.$gettext(
							`Your Google account did not return an email address. Make sure you have verified it with Google.`
						),
					});
					break;

				case 'duplicate-email':
					showErrorGrowl({
						sticky: true,
						message: this.$gettext(
							`The email address on this Google account is already in use. Perhaps you already have an account?`
						),
					});
					break;

				case 'no-unique-username':
					showErrorGrowl({
						sticky: true,
						message: this.$gettext(
							`Could not create a username for your account. Perhaps you already have an account?`
						),
					});
					break;

				case 'invalid-google-account':
					showErrorGrowl({
						sticky: true,
						message: this.$gettext(
							'This Google account does not support Sign Up with Google.'
						),
					});
					break;

				default:
					showErrorGrowl({
						sticky: true,
						title: this.$gettext('Login Failed'),
						message: this.$gettext('Unable to log in with Google.'),
					});
					break;
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		if ($payload.accountCreated) {
			authOnJoin('google');
			redirectToOnboarding();
			return;
		}

		authOnLogin('google');
		redirectToDashboard();
	}

	render() {
		return h(AuthLinkedAccountProcessing);
	}
}
