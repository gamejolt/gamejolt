import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

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
			switch ($payload.reason) {
				case 'no-email':
					Growls.error({
						sticky: true,
						message: this.$gettext(
							`Your Google account did not return an email address. Make sure you have verified it with Google.`
						),
					});
					break;

				case 'duplicate-email':
					Growls.error({
						sticky: true,
						message: this.$gettext(
							`The email address on this Google account is already in use. Perhaps you already have an account?`
						),
					});
					break;

				case 'no-unique-username':
					Growls.error({
						sticky: true,
						message: this.$gettext(
							`Could not create a username for your account. Perhaps you already have an account?`
						),
					});
					break;

				case 'invalid-google-account':
					Growls.error({
						sticky: true,
						message: this.$gettext(
							'This Google account does not support Sign Up with Google.'
						),
					});
					break;

				default:
					Growls.error({
						sticky: true,
						title: this.$gettext('Login Failed'),
						message: this.$gettext('Unable to log in with Google.'),
					});
					break;
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		Auth.redirectDashboard();
	}

	render(h: CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
