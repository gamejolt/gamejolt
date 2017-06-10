import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./email-preferences.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../account.state';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { BeforeRouteEnter } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { FormEmailPreferences } from '../../../../components/forms/email-preferences/email-preferences';

@View
@Component({
	components: {
		FormEmailPreferences,
	},
})
export default class RouteDashAccountEmailPreferences extends Vue
{
	@RouteMutation setHeading: RouteStore['setHeading'];

	user: User = null as any;

	@BeforeRouteEnter()
	routeEnter()
	{
		return Api.sendRequest( '/web/dash/email-preferences' );
	}

	created()
	{
		Meta.title = this.$gettext( `dash.email_prefs.page_title` );
		this.setHeading( this.$gettext( 'dash.email_prefs.heading' ) );
	}

	routed()
	{
		this.user = new User( this.$payload.user );
	}
}
