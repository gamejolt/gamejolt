import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { UserGameScore } from 'game-jolt-frontend-lib/components/user/game-score/game-score.model';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Component({
	name: 'RouteDashGamesManageApiScoreboardsScoresList',
	components: {
		AppManageGameListScores,
	},
})
@RouteResolver({
	deps: { params: ['table'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-scores/' +
				route.params.id +
				'/' +
				route.params.table
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable = null as any;
	selectedTable = 0;
	scores: UserGameScore[] = [];

	get routeTitle() {
		if (this.game && this.scoreTable) {
			return this.$gettextInterpolate(`View Scores for %{ table } - %{ game }`, {
				game: this.game.title,
				table: this.scoreTable.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.scoreTables = GameScoreTable.populate($payload.scoreTables);
		this.scoreTable = new GameScoreTable($payload.scoreTable);
		this.scores = UserGameScore.populate($payload.scores);

		this.selectedTable = this.scoreTables.find(i => i.id === this.scoreTable.id)!.id;
	}

	changeTable() {
		Scroll.shouldAutoScroll = false;
		this.$router.push({
			name: this.$route.name,
			params: Object.assign({}, this.$route.params, {
				table: this.selectedTable,
			}),
		});
		// $state.go($state.current, { table: tableId });
	}

	onScoreRemoved(score: UserGameScore) {
		const index = this.scores.findIndex(i => i.id === score.id);
		if (index !== -1) {
			this.scores.splice(index, 1);
		}
	}
}
