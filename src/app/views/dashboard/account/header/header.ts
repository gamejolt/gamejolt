import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./header.html';

import { Store } from '../../../../store/index';
import { RouteStore, RouteMutation } from '../account.store';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormUserHeader } from '../../../../components/forms/user-header/header';

@View
@Component({
	name: 'RouteDashAccountHeader',
	components: {
		AppJolticon,
		FormUserHeader,
	},
})
export default class RouteDashAccountHeader extends BaseRouteComponent {
	@State app: Store['app'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	readonly Screen = Screen;

	get routeTitle() {
		return this.$gettext('Your Header');
	}

	routeInit() {
		this.setHeading(this.$gettext('Getting a Header image'));
	}
}
