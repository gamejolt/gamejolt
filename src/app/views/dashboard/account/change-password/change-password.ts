import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./change-password.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteMutation, RouteStore } from '../account.state';
import { FormChangePassword } from '../../../../components/forms/change-password/change-password';

@View
@Component({
	components: {
		FormChangePassword,
	},
})
export default class RouteDashAccountChangePassword extends Vue
{
	@RouteMutation setHeading: RouteStore['setHeading'];

	created()
	{
		Meta.title = this.$gettext( `dash.change_pass.page_title` );
		this.setHeading( this.$gettext( 'dash.change_pass.heading' ) );
	}
}
