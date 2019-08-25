import { Component } from 'vue-property-decorator';
import AppAuthJoin from '../../../../_common/auth/join/join.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { loggedUserBlock } from '../auth';

@Component({
	name: 'RouteAuthJoin',
	components: {
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
