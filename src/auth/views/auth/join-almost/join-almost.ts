import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./join-almost.html';

import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import { AppProgressPoller } from '../../../../lib/gj-lib-client/components/progress/poller/poller';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Store } from '../../../store/index';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteJoinAlmost',
	components: {
		AppProgressPoller,
	},
})
export default class RouteJoinAlmost extends BaseRouteComponent {
	@State credentials: Store['credentials'];

	get routeTitle() {
		return this.$gettext('auth.join.almost.page_title');
	}

	async onAuthorized() {
		if (!this.credentials) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		const response = await Api.sendRequest('/web/auth/login', this.credentials);
		if (!response.success) {
			Growls.error({
				message: this.$gettext(`Couldn't log you in for some reason.`),
				sticky: true,
			});
			return;
		}

		// If it worked, redirect to dashboard. They're good to go!
		Auth.redirectDashboard();
	}
}
