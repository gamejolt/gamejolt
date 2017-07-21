import { Component } from 'vue-property-decorator';
import * as View from '!view!./financials.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../account.store';
import { FormFinancials } from '../../../../components/forms/financials/financials';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		FormFinancials,
	},
})
export default class RouteDashAccountFinancials extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	routeInit() {
		Meta.title = this.$gettext('Marketplace Account Setup');
		this.setHeading(this.$gettext('Marketplace Account Setup'));
	}
}
