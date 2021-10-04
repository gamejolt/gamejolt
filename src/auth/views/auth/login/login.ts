import { Component } from 'vue-property-decorator';
import { LocationRedirect } from '../../../../utils/router';
import AppAuthLogin from '../../../../_common/auth/login/login.vue';
import { Growls } from '../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Translate } from '../../../../_common/translate/translate.service';
import { loggedUserBlock } from '../auth';

@Component({
	name: 'RouteAuthLogin',
	components: {
		AppAuthLogin,
	},
})
@RouteResolver({
	deps: { query: ['intent'] },
	async resolver({ route }) {
		if (route.query.intent === 'approve-login-expired') {
			Growls.error({
				sticky: true,
				message: Translate.$gettext('This login attempt has expired. Try again.'),
			});
			return LocationRedirect.fromRoute(route, {}, { intent: undefined });
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
