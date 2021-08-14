import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { User } from '../../../../../../_common/user/user.model';
import AppFollowerList from '../../../../../components/follower/list/list.vue';
import { RouteStore, RouteStoreModule } from '../view.store';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/discover/games/followers/${route.params.id}`;
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
	game!: RouteStore['game'];

	users: User[] = [];

	get routeTitle() {
		return this.game ? `People following ${this.game.title}` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = User.populate($payload.users);
	}
}
