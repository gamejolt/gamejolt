import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import {
	authOnJoin,
	authOnLogin,
	redirectToDashboard,
	redirectToOnboarding,
} from '../../../../../../_common/auth/auth.service';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

@Component({
	name: 'RouteAuthLinkedAccountTwitterCallback',
})
@RouteResolver({
	lazy: true,
	resolver({ route }) {
		const { code, state } = route.query;
		return Api.sendRequest(
			'/web/auth/linked-accounts/link_callback/twitter?code=' + code + '&state=' + state,
			{}
		);
	},
})
export default class RouteAuthLinkedAccountTwitterCallback extends BaseRouteComponent {
	routeResolved($payload: any) {
		if (!$payload.success) {
			if ($payload.reason && $payload.reason === 'no-email') {
				Growls.error({
					sticky: true,
					title: this.$gettext('Login failed'),
					message: this.$gettext(
						'There is no verified email address associated with your Twitter account.'
					),
				});
			} else {
				Growls.error({
					sticky: true,
					title: this.$gettext('auth.linked_account.twitter.failed_growl_title'),
					message: this.$gettext('auth.linked_account.twitter.failed_growl'),
				});
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		if ($payload.accountCreated) {
			authOnJoin('twitter');
			redirectToOnboarding();
			return;
		}

		authOnLogin('twitter');
		redirectToDashboard();
	}

	render(h: CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
