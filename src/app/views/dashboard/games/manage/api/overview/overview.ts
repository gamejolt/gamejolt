import View from '!view!./overview.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { duration } from '../../../../../../../lib/gj-lib-client/vue/filters/duration';
import { number } from '../../../../../../../lib/gj-lib-client/vue/filters/number';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
