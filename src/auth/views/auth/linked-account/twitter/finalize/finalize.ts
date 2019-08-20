// TODO template file is missing, is this intentional?
// import View from '!view!./finalize.html';
import { Component } from 'vue-property-decorator';
import { Auth } from '../../../../../../_common/auth/auth.service';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import FormTwitterEmail from '../../../../../components/forms/twitter-email/twitter-email';

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
