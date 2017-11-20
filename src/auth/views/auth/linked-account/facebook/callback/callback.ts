import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';

import { AuthLinkedAccountProcessing } from '../../_processing/processing';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Auth } from '../../../../../../lib/gj-lib-client/components/auth/auth.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteAuthLinkedAccountFacebookCallback',
})
export default class RouteAuthLinkedAccountFacebookCallback extends BaseRouteComponent {
	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		const { code, state } = route.query;
		return Api.sendRequest('/web/auth/facebook/callback?code=' + code + '&state=' + state, {});
	}

	routed($payload: any) {
		if (!$payload.success) {
			if ($payload.reason && $payload.reason === 'no-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(`auth.linked_account.facebook.no_email_growl`),
				});
			} else if ($payload.reason && $payload.reason === 'duplicate-email') {
				Growls.error({
					sticky: true,
					message: this.$gettext(`auth.linked_account.facebook.duplicate_email_growl`),
				});
			} else {
				Growls.error({
					sticky: true,
					title: this.$gettext('Login Failed'),
					message: this.$gettext('auth.linked_account.facebook.failed_growl'),
				});
			}
			this.$router.push({ name: 'auth.join' });
			return;
		}

		Auth.redirectDashboard();
	}

	render(h: Vue.CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
