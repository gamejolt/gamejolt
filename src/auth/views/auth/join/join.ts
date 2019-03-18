import AppAuthJoin from 'game-jolt-frontend-lib/components/auth/join/join.vue';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import { loggedUserBlock } from '../auth';

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
