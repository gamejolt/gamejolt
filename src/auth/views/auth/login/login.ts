import AppAuthLogin from 'game-jolt-frontend-lib/components/auth/login/login.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { loggedUserBlock } from '../auth';

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
		this.redirect = (this.$route.query.redirect as string) || '';
	}
}
