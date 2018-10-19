import View from '!view!./change-password.html';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormChangePassword } from '../../../../components/forms/change-password/change-password';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/account/has-password'),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`dash.change_pass.page_title`));
	},
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	hasPassword = true;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.hasPassword = $payload.hasPassword;
	}
}
