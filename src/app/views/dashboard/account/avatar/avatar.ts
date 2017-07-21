import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./avatar.html';

import { Store } from '../../../../store/index';
import { RouteStore, RouteMutation } from '../account.store';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export default class RouteDashAccountAvatar extends BaseRouteComponent {
	@State app: Store['app'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	Screen = makeObservableService(Screen);

	routeInit() {
		Meta.title = this.$gettext(`dash.avatar.page_title`);
		this.setHeading(this.$gettext('dash.avatar.heading'));
	}
}
