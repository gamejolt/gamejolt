import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteStore, RouteStoreModule } from '../view.store';
import AppFollowerList from '../../../../../components/follower/list/list.vue';

function getFetchUrl(route: Route) {
	return `/web/discover/games/followers/${route.params.id}`;
}

@Component({
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
