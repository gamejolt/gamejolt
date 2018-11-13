import View from '!view!./login.html';
import { Component } from 'vue-property-decorator';
import { AppAuthLogin } from '../../../../lib/gj-lib-client/components/auth/login/login';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { loggedUserBlock } from '../auth';

@View
@Component({
	name: 'RouteAuthLogin',
	components: {
		AppAuthLogin,
	},
})
@RouteResolver({
	async resolver() {
		return loggedUserBlock();
	},
})
export default class RouteAuthLogin extends BaseRouteComponent {
	redirect = '';

	get routeTitle() {
		return this.$gettext('auth.login.page_title');
	}

	routeCreated() {
		this.redirect = this.$route.query.redirect || '';
	}
}
