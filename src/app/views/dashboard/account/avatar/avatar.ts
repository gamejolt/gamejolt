import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./avatar.html';

import { Store } from '../../../../store/index';
import { RouteStore, RouteMutation } from '../account.store';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { FormAvatar } from '../../../../components/forms/avatar/avatar';

@View
@Component({
	name: 'RouteDashAccountAvatar',
	components: {
		AppJolticon,
		FormAvatar,
	},
})
export default class RouteDashAccountAvatar extends BaseRouteComponent {
	@State app: Store['app'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	Screen = makeObservableService(Screen);

	get routeTitle() {
		return this.$gettext('Your Avatar');
	}

	routeInit() {
		this.setHeading(this.$gettext('Getting an Avatar'));
	}
}
