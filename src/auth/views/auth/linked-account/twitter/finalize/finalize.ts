import View from '!view!./finalize.html';
import { Component } from 'vue-property-decorator';
import { Auth } from '../../../../../../lib/gj-lib-client/components/auth/auth.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { FormTwitterEmail } from '../../../../../components/forms/twitter-email/twitter-email';

@View
@Component({
	name: 'RouteAuthLinkedAccountTwitterFinalize',
	components: {
		FormTwitterEmail,
	},
})
export default class RouteAuthLinkedAccountTwitterFinalize extends BaseRouteComponent {
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
