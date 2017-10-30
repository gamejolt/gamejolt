import { Component } from 'vue-property-decorator';
import View from '!view!./financials.html';

import { RouteMutation, RouteStore } from '../account.store';
import { FormFinancials } from '../../../../components/forms/financials/financials';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccountFinancials',
	components: {
		FormFinancials,
	},
})
export default class RouteDashAccountFinancials extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	get routeTitle() {
		return this.$gettext('Marketplace Account Setup');
	}

	routeInit() {
		this.setHeading(this.$gettext('Marketplace Account Setup'));
	}
}
