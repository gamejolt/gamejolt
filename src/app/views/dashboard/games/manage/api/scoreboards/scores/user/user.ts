import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserGameScore } from 'game-jolt-frontend-lib/components/user/game-score/game-score.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import { RouteStore, RouteStoreModule } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Component({
	name: 'RouteDashGamesManageApiScoreboardsScoresUser',
	components: {
		AppJolticon,
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

		Growls.success(
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
