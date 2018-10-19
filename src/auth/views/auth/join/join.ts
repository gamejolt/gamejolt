import View from '!view!./join.html';
import { Component } from 'vue-property-decorator';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { loggedUserBlock } from '../auth';

@View
@Component({
	name: 'RouteAuthJoin',
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
@RouteResolver({
	async resolver() {
		return loggedUserBlock();
	},
})
export default class RouteAuthJoin extends BaseRouteComponent {
	readonly Connection = Connection;

	get routeTitle() {
		return this.$gettext('auth.join.page_title');
	}
}
