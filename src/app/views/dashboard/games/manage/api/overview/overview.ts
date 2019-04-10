import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { duration } from 'game-jolt-frontend-lib/vue/filters/duration';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageApiOverview',
	directives: {
		AppTooltip,
	},
	filters: {
		number,
		duration,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/dash/developer/games/api/' + route.params.id),
})
export default class RouteDashGamesManageApiOverview extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	numActiveSessions = 0;
	numActiveTrophies = 0;
	numGlobalItems = 0;
	totalAchievedTrophies = 0;
	totalScores = 0;
	totalTrophyExp = 0;
	totalUsersWithScores = 0;
	totalUsersWithTrophies = 0;
	sessionStats: {
		avg: number;
		time: number;
		'user-count': number;
	} = {} as any;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Game API for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.sessionStats = $payload.sessionStats;

		const fields = [
			'numActiveTrophies',
			'totalTrophyExp',
			'totalAchievedTrophies',
			'totalUsersWithTrophies',
			'totalScores',
			'totalUsersWithScores',
			'numActiveSessions',
			'numGlobalItems',
		];

		fields.forEach(field => {
			(this as any)[field] = $payload[field] || 0;
		});
	}
}
