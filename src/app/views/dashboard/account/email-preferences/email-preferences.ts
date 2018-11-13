import View from '!view!./email-preferences.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { FormEmailPreferences } from '../../../../components/forms/email-preferences/email-preferences';
import { IntentService } from '../../../../components/intent/intent.service';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountEmailPreferences',
	components: {
		FormEmailPreferences,
	},
})
@RouteResolver({
	deps: { query: ['intent'] },
	async resolver({ route }) {
		const intentRedirect = IntentService.checkRoute(route, {
			intent: 'unsubscribe',
			message: Translate.$gettext(`We have updated your email preferences.`),
		});
		if (intentRedirect) {
			return intentRedirect;
		}

		return Api.sendRequest('/web/dash/email-preferences');
	},
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`dash.email_prefs.page_title`));
	},
})
export default class RouteDashAccountEmailPreferences extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	user: User = null as any;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.user = new User($payload.user);
	}
}
