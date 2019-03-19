// TODO template file is missing, is this intentional?
// import View from '!view!./finalize.html';
import { Auth } from 'game-jolt-frontend-lib/components/auth/auth.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
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
