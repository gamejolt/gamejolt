import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./authorize.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';

@View
@Component({})
export default class RouteAuthAuthorize extends Vue
{
	isSuccess = false;

	@BeforeRouteEnter()
	routeEnter( this: undefined, route: VueRouter.Route )
	{
		const { userId, code, type } = route.params;
		return Api.sendRequest( `/web/auth/authorize/${ userId }/${ code }/${ type }` );
	}

	routed()
	{
		this.isSuccess = this.$payload.success;

		// Redirect them to their dashboard after a bit.
		if ( this.isSuccess ) {
			setTimeout( () => Auth.redirectDashboard(), 3000 );
			Meta.title = this.$gettext( 'Redirecting...' );
		}
		else {
			Meta.title = this.$gettext( 'auth.authorize.invalid.page_title' );
		}
	}
}
