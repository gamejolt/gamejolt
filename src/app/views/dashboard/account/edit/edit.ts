import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./edit.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { RouteMutation, RouteStore } from '../account.state';
import { FormProfile } from '../../../../components/forms/profile/profile';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		FormProfile,
	},
})
export default class RouteDashAccountEdit extends Vue
{
	@State app: Store['app'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	created()
	{
		Meta.title = this.$gettext( `dash.profile.edit.page_title` );
		this.setHeading( this.$gettext( 'dash.profile.edit.heading' ) );
	}

	onProfileSaved()
	{
		Growls.success(
			this.$gettext( `Your information has been updated. Right on!` ),
		);
		Scroll.to( 0 );
	}
}

