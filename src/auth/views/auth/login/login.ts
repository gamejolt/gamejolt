import View from '!view!./login.html';
import { Component } from 'vue-property-decorator';
import { AppAuthLogin } from '../../../../lib/gj-lib-client/components/auth/login/login';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { loggedUserBlock } from '../auth';

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
}
