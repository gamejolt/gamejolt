import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./finalize.html';

import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Auth } from '../../../../../../lib/gj-lib-client/components/auth/auth.service';
import { FormTwitterEmail } from '../../../../../components/forms/twitter-email/twitter-email';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthLinkedAccountTwitterFinalize',
	components: {
		FormTwitterEmail,
	},
})
export default class RouteAuthLinkedAccountTwitterFinalize extends BaseRouteComponent {
	@Prop(String) state: string;

	get routeTitle() {
		return this.$gettext('auth.linked_account.twitter.finalize.page_title');
	}

	onSubmitted() {
		Growls.success(
			this.$gettext('auth.linked_account.twitter.created_growl'),
			this.$gettext('auth.linked_account.twitter.created_growl_title')
		);
		setTimeout(() => Auth.redirectDashboard(), 3000);
	}
}
