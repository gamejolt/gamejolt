import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./join-almost.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import { AppProgressPoller } from '../../../../lib/gj-lib-client/components/progress/poller/poller';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({
	components: {
		AppProgressPoller,
	}
})
export default class RouteJoinAlmost extends Vue
{
	@State credentials: any;

	created()
	{
		Meta.title = this.$gettext( 'auth.join.almost.page_title' );
	}

	async onAuthorized()
	{
		if ( !this.credentials.username || !this.credentials.password ) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		const response = await Api.sendRequest( '/web/auth/login', this.credentials );
		if ( !response.success ) {
			Growls.error( {
				message: this.$gettext( `Couldn't log you in for some reason.` ),
				sticky: true,
			} );
			return;
		}

		// If it worked, redirect to dashboard. They're good to go!
		Auth.redirectDashboard();
	}
}
