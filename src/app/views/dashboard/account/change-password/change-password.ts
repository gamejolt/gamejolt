import { Component } from 'vue-property-decorator';
import * as View from '!view!./change-password.html';

import { RouteMutation, RouteStore } from '../account.store';
import { FormChangePassword } from '../../../../components/forms/change-password/change-password';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	get routeTitle() {
		return this.$gettext(`dash.change_pass.page_title`);
	}

	routeInit() {
		this.setHeading(this.$gettext('dash.change_pass.heading'));
	}
}
