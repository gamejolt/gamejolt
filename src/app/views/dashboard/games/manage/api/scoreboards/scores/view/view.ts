import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./view.html';

import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { UserGameScore } from '../../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { GameScoreTable } from '../../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { RouteState, RouteStore } from '../../../../manage.store';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageApiScoreboardsScoresView',
	components: {
		AppJolticon,
	},
	filters: {
		number,
		date,
	},
})
export default class RouteDashGamesManageApiScoreboardsScoresView extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	score: UserGameScore = null as any;
	scoreTable: GameScoreTable = null as any;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/scores/' + route.params.id + '/' + route.params.score
		);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Score Details - %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed() {
		this.score = new UserGameScore(this.$payload.score);
		this.scoreTable = new GameScoreTable(this.$payload.scoreTable);
	}

	async removeScore() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.scores.view.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await this.score.$remove();

		this.$router.push({
			name: 'dash.games.manage.api.scoreboards.scores.list',
			params: {
				table: this.score.table_id + '',
			},
		});
	}
}
