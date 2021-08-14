import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { User } from '../../../../_common/user/user.model';
import AppFollowerList from '../../../components/follower/list/list.vue';
import { RouteStore, RouteStoreModule } from '../profile.store';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/profile/followers/@${route.params.username}`;
}

@Options({
	name: 'RouteProfileFollowers',
	components: {
		AppFollowerList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowers extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	users: User[] = [];

	get routeTitle() {
		return this.user
			? `People following ${this.user.display_name} (@${this.user.username})`
			: null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = User.populate($payload.users);
	}
}
