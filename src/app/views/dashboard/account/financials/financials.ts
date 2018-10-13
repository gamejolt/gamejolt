import View from '!view!./financials.html';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormFinancials } from '../../../../components/forms/financials/financials';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
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
