import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./email-preferences.html';

import { RouteMutation, RouteStore } from '../account.store';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { FormEmailPreferences } from '../../../../components/forms/email-preferences/email-preferences';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { IntentService } from '../../../../components/intent/intent.service';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';

@View
@Component({
	name: 'RouteDashAccountEmailPreferences',
	components: {
		FormEmailPreferences,
	},
})
export default class RouteDashAccountEmailPreferences extends BaseRouteComponent {
	@RouteMutation setHeading!: RouteStore['setHeading'];

	user: User = null as any;

	@RouteResolve()
	async routeResolve(this: undefined, route: Route) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'unsubscribe',
			message: Translate.$gettext(`We have updated your email preferences.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/email-preferences');
	}

	get routeTitle() {
		return this.$gettext(`dash.email_prefs.page_title`);
	}

	routeInit() {
		this.setHeading(this.$gettext('dash.email_prefs.heading'));
	}

	routed($payload: any) {
		this.user = new User($payload.user);
	}
}
