import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./login.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthLogin } from '../../../../lib/gj-lib-client/components/auth/login/login';
import { appStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';

@View
@Component({
	name: 'route-auth-login',
	components: {
		AppJolticon,
		AppAuthLogin,
	},
	beforeRouteEnter( _to, _from, next )
	{
		// Redirect right away if they are logged in.
		if ( appStore.state && appStore.state.user ) {
			Auth.redirectDashboard();
			return next( false );
		}
		next();
	}
})
export default class RouteAuthLogin extends Vue
{
	created()
	{
		Meta.title = this.$gettext( 'auth.login.page_title' );
	}

	// this.onLoggedIn = function( formModel )
	// {
	// 	if ( $stateParams.redirect ) {

	// 		// We don't want them to be able to put in an offsite link as the redirect URL.
	// 		// So we only open up certain domains.
	// 		// Otherwise we simply attach it to the main domain.

	// 		// Subdomain redirect: jams.gamejolt.io, fireside.gamejolt.com, etc.
	// 		if ( $stateParams.redirect.search( /^https?:\/\/([a-zA-Z\.]+\.)gamejolt.(com|io)/ ) !== -1 ) {
	// 			$window.location = $stateParams.redirect;
	// 			return;
	// 		}

	// 		// Normal redirect, within the gamejolt.com domain.
	// 		// Since that's the case, we can set through $location so it doesn't have to reload the scripts.
	// 		$window.location = Environment.baseUrl + $stateParams.redirect;
	// 		return;
	// 	}

	// 	App.redirectDashboard();
	// };

	// this.linkedAccountLogin = function( provider )
	// {
	// 	User_LinkedAccounts.login( provider );
	// };
}
