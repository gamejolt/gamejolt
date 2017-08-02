import { Component } from 'vue-property-decorator';
import * as View from '!view!./email-preferences.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../account.store';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { FormEmailPreferences } from '../../../../components/forms/email-preferences/email-preferences';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccountEmailPreferences',
	components: {
		FormEmailPreferences,
	},
})
export default class RouteDashAccountEmailPreferences extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	user: User = null as any;

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/dash/email-preferences');
	}

	routeInit() {
		Meta.title = this.$gettext(`dash.email_prefs.page_title`);
		this.setHeading(this.$gettext('dash.email_prefs.heading'));
	}

	routed() {
		this.user = new User(this.$payload.user);
	}
}
