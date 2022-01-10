import { Options } from 'vue-property-decorator';
import { RouteLocationRedirect } from '../../../../utils/router';
import AppAuthLogin from '../../../../_common/auth/login/login.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { loggedUserBlock } from '../auth';

@Options({
	name: 'RouteAuthLogin',
	components: {
		AppAuthLogin,
	},
})
@RouteResolver({
	deps: { query: ['intent'] },
	async resolver({ route }) {
		if (route.query.intent === 'approve-login-expired') {
			showErrorGrowl({
				sticky: true,
				message: $gettext('This login attempt has expired. Try again.'),
			});
			return RouteLocationRedirect.fromRoute(route, {}, { intent: undefined });
		}

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
