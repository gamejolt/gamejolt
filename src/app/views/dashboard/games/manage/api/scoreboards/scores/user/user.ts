import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameScoreTable } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { UserGameScore } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { User } from '../../../../../../../../../_common/user/user.model';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresUser',
	components: {
		AppManageGameListScores,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['table', 'user'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-user-scores/' +
				route.params.id +
				'/' +
				route.params.table +
				'/' +
				route.params.user
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresUser extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	user: User = null as any;
	scoreTable: GameScoreTable = null as any;
	scores: UserGameScore[] = [];

	get routeTitle() {
		if (this.game && this.user && this.scoreTable) {
			return this.$gettextInterpolate('View Scores for %{ user } on %{ table } - %{ game }', {
				game: this.game.title,
				user: this.user.display_name,
				table: this.scoreTable.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.user = new User($payload.user);
		this.scoreTable = new GameScoreTable($payload.scoreTable);
		this.scores = UserGameScore.populate($payload.scores);
	}

	onScoreRemoved(score: UserGameScore) {
		const index = this.scores.findIndex(i => i.id === score.id);
		if (index !== -1) {
			this.scores.splice(index, 1);
		}
	}

	async removeAll() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.scores.user.list.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await this.scoreTable.$removeAllUserScores(this.user.id);

		showSuccessGrowl(
			this.$gettext(`All of the user's scores have been removed from the scoreboard.`),
			this.$gettext(`Scores Removed`)
		);

		this.$router.push({
			name: 'dash.games.manage.api.scoreboards.scores.list',
			params: {
				table: this.scoreTable.id + '',
			},
		});
	}
}
