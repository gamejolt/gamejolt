import { Options } from 'vue-property-decorator';
import AppAuthLogin from '../../../../_common/auth/login/login.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { loggedUserBlock } from '../auth';

@Options({
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
