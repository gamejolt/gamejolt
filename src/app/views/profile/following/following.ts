import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { User } from '../../../../_common/user/user.model';
import AppFollowerList from '../../../components/follower/list/list.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

function getFetchUrl(route: Route) {
	return `/web/profile/following/@${route.params.username}`;
}

@Component({
	name: 'RouteProfileFollowing',
	components: {
		AppFollowerList,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowing extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	users: User[] = [];

	get routeTitle() {
		return this.user
			? `People followed by ${this.user.display_name} (@${this.user.username})`
			: null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = User.populate($payload.users);
	}
}
