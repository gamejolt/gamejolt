import View from '!view!./authorize.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthAuthorize',
})
@RouteResolver({
	resolver({ route }) {
		const { userId, code, type } = route.params;
		return Api.sendRequest(`/web/auth/authorize/${userId}/${code}/${type}`);
	},
})
export default class RouteAuthAuthorize extends BaseRouteComponent {
	isSuccess = false;

	get routeTitle() {
		if (this.isSuccess) {
			return this.$gettext('Redirecting...');
		}

		return this.$gettext('auth.authorize.invalid.page_title');
	}

	routeResolved($payload: any) {
		this.isSuccess = $payload.success;

		// Redirect them to their dashboard after a bit.
		if (this.isSuccess) {
			setTimeout(() => Auth.redirectDashboard(), 3000);
		}
	}
}
