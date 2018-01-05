import { Mutation } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./join.html';

import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Store } from '../../../store/index';
import { loggedUserBlock } from '../auth';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthJoin',
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
export default class RouteAuthJoin extends BaseRouteComponent {
	@Mutation setCredentials: Store['setCredentials'];

	readonly Connection = Connection;

	@RouteResolve()
	async routeResolve() {
		return loggedUserBlock();
	}

	get routeTitle() {
		return this.$gettext('auth.join.page_title');
	}

	async onJoin(formModel: any) {
		// TODO(mailer-panic) This is temporarily disabled to allow new registers to bypass verification.
		// Enable this once mailer is good to go.
		// // We store these so we can log them in automatically once their
		// // verification happens.
		// this.setCredentials({
		// 	username: formModel.username,
		// 	password: formModel.password,
		// });

		// this.$router.push({ name: 'auth.join-almost' });

		// Same as what join-almost does when waiting for verification.
		const response = await Api.sendRequest('/web/auth/login', {
			username: formModel.username,
			password: formModel.password,
		});

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
