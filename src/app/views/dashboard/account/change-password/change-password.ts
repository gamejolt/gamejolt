import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import FormChangePassword from '../../../../components/forms/change-password/change-password.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

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
