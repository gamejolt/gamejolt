import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Scroll } from '../../../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { UserGameScore } from '../../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { Meta } from '../../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../../../manage.store';
import { GameScoreTable } from '../../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { AppManageGameListScores } from '../../_list-scores/list-scores';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageApiScoreboardsScoresList',
	components: {
		AppManageGameListScores,
	},
})
export default class RouteDashGamesManageApiScoreboardsScoresList extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable = null as any;
	selectedTable = 0;
	scores: UserGameScore[] = [];

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-scores/' +
				route.params.id +
				'/' +
				route.params.table
		);
	}

	routed() {
		this.scoreTables = GameScoreTable.populate(this.$payload.scoreTables);
		this.scoreTable = new GameScoreTable(this.$payload.scoreTable);
		this.scores = UserGameScore.populate(this.$payload.scores);

		this.selectedTable = this.scoreTables.find(i => i.id === this.scoreTable.id)!.id;

		Meta.title = this.$gettextInterpolate(`View Scores for %{ table } - %{ game }`, {
			game: this.game.title,
			table: this.scoreTable.name,
		});
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
