import { Component } from 'vue-property-decorator';
import View from '!view!./join.html';

import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { loggedUserBlock } from '../auth';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteAuthJoin',
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
export default class RouteAuthJoin extends BaseRouteComponent {
	readonly Connection = Connection;

	@RouteResolve()
	async routeResolve() {
		return loggedUserBlock();
	}

	get routeTitle() {
		return this.$gettext('auth.join.page_title');
	}
}
