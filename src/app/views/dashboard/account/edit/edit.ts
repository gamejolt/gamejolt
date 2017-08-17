import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./edit.html';

import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { RouteMutation, RouteStore } from '../account.store';
import { FormProfile } from '../../../../components/forms/profile/profile';
import { Store } from '../../../../store/index';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashAccountEdit',
	components: {
		FormProfile,
	},
})
export default class RouteDashAccountEdit extends BaseRouteComponent {
	@State app: Store['app'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	get routeTitle() {
		return this.$gettext(`dash.profile.edit.page_title`);
	}

	routeInit() {
		this.setHeading(this.$gettext('dash.profile.edit.heading'));
	}

	onProfileSaved() {
		Growls.success(this.$gettext(`Your information has been updated. Right on!`));
		Scroll.to(0);
	}
}
