import { Component } from 'vue-property-decorator';
import View from '!view!./login.html';

import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthLogin } from '../../../../lib/gj-lib-client/components/auth/login/login';
import { loggedUserBlock } from '../auth';
import { UserLinkedAccounts } from '../../../../lib/gj-lib-client/components/user/linked-accounts/linked-accounts.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthLogin',
	components: {
		AppJolticon,
		AppAuthLogin,
	},
})
export default class RouteAuthLogin extends BaseRouteComponent {
	redirect = '';

	@RouteResolve()
	async routeResolve() {
		return loggedUserBlock();
	}

	get routeTitle() {
		return this.$gettext('auth.login.page_title');
	}

	routeInit() {
		this.redirect = this.$route.query.redirect || '';
	}

	linkedAccountLogin(provider: any) {
		UserLinkedAccounts.login(this.$router, provider);
	}
}
