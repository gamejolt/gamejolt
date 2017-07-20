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

@Component({})
export default class RouteAuthLinkedAccountTwitterCallback extends BaseRouteComponent {
	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		const { oauth_verifier, state } = route.query;
		return Api.sendRequest(
			'/web/auth/twitter/callback?oauth_verifier=' + oauth_verifier + '&state=' + state,
			{}
		);
	}

	routed() {
		if (!this.$payload.success) {
			// If they don't have an account yet, let's create one for them. For
			// Twitter, they need to fill out their email address, so take them
			// to the page to do that.
			if (this.$payload.reason && this.$payload.reason === 'no-account') {
				this.$router.push({
					name: 'auth.linked-account.twitter.finalize',
					params: { state: this.$route.params.state },
				});
			} else {
				Growls.error({
					sticky: true,
					title: this.$gettext('auth.linked_account.twitter.failed_growl_title'),
					message: this.$gettext('auth.linked_account.twitter.failed_growl'),
				});
				this.$router.push({ name: 'auth.join' });
			}
			return;
		}

		Auth.redirectDashboard();
	}

	render(h: Vue.CreateElement) {
		return h(AuthLinkedAccountProcessing);
	}
}
