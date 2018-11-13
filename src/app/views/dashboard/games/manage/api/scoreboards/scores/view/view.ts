import View from '!view!./view.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameScoreTable } from '../../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { UserGameScore } from '../../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';
import { number } from '../../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

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
@RouteResolver({
	deps: { params: ['score'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/' + route.params.id + '/' + route.params.score
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresView extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	score: UserGameScore = null as any;
	scoreTable: GameScoreTable = null as any;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Score Details - %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.score = new UserGameScore($payload.score);
		this.scoreTable = new GameScoreTable($payload.scoreTable);
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
