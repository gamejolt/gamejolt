import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { UserGameScore } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresView',
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

	readonly formatNumber = formatNumber;
	readonly formatDate = formatDate;

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