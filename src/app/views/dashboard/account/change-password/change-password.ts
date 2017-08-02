import { Component } from 'vue-property-decorator';
import * as View from '!view!./change-password.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
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

	routeInit() {
		Meta.title = this.$gettext(`dash.change_pass.page_title`);
		this.setHeading(this.$gettext('dash.change_pass.heading'));
	}
}
