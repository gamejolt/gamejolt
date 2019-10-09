import Component from 'vue-class-component';
import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { TrophyNavGame } from './_nav/nav';
import AppProfileTrophiesNav from './_nav/nav.vue';

@Component({
	name: 'RouteProfileTrophies',
	components: {
		AppProfileTrophiesNav,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/profile/trophies/@' + route.params.username),
})
export default class RouteProfileTrophies extends BaseRouteComponent {
	games: TrophyNavGame[] = [];
	siteTrophyCount = 0;
	unviewedGames: number[] = [];

	routeResolved($payload: any) {
		if ($payload.games) {
			this.games = $payload.games;
		}
		this.siteTrophyCount = $payload.siteTrophyCount || 0;
		if ($payload.unviewedGames) {
			this.unviewedGames = $payload.unviewedGames;
		}
	}
}
