import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import FormFinancials from '../../../../components/forms/financials/financials.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Component({
	name: 'RouteDashAccountFinancials',
	components: {
		FormFinancials,
	},
})
@RouteResolver({
	resolver: () => Promise.resolve(),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`Marketplace Account Setup`));
	},
})
export default class RouteDashAccountFinancials extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	get routeTitle() {
		return this.heading;
	}
}
