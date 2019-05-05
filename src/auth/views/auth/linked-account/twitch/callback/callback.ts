import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

@Component({
	name: 'RouteAuthLinkedAccountTwitchCallback',
})
@RouteResolver({
	lazy: true,
	resolver({ route }) {
		const { code, state } = route.query;
		return Api.sendRequest(
			'/web/auth/linked-accounts/link_callback/twitch?code=' + code + '&state=' + state,
			{}
		);
	},
})
export default class RouteAuthLinkedAccountTwitchCallback extends BaseRouteComponent {
	routeResolved($payload: any) {
		if (!$payload.success) {
			if ($payload.reason && $payload.reason === 'no-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(
						`Your Twitch account did not return an email address. Make sure you have verified it with Twitch.`
					),
				});
			} else if ($payload.reason && $payload.reason === 'duplicate-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(
						`The email address on this Twitch account is already in use. Perhaps you already have an account?`
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
					message: this.$gettext('Unable to log in with Twitch.'),
				});
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		if ($payload.accountCreated) {
			Auth.redirectOnboarding();
			return;
		}

		Auth.redirectDashboard();
	}

	render(h: CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
