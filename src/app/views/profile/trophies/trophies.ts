import { Options } from 'vue-property-decorator';
import { stringSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { TrophyNavGame } from './_nav/nav';
import AppProfileTrophiesNav from './_nav/nav.vue';

@Options({
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

	readonly Screen = Screen;

	routeResolved($payload: any) {
		if ($payload.games) {
			this.games = $payload.games;
			this.games = this.games.sort((a, b) => stringSort(a.title, b.title));
		}
		this.siteTrophyCount = $payload.siteTrophyCount || 0;
		if ($payload.unviewedGames) {
			this.unviewedGames = $payload.unviewedGames;
		}
	}
}
