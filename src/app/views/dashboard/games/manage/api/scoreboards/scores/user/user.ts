import View from '!view!./user.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameScoreTable } from '../../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { Growls } from '../../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTooltip } from '../../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { UserGameScore } from '../../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { User } from '../../../../../../../../../lib/gj-lib-client/components/user/user.model';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { RouteState, RouteStore } from '../../../../manage.store';
import { AppManageGameListScores } from '../../_list-scores/list-scores';

@View
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
export default class RouteDashGamesManageApiScoreboardsScoresUser extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	user: User = null as any;
	scoreTable: GameScoreTable = null as any;
	scores: UserGameScore[] = [];

	@RouteResolve({
		deps: { params: ['table', 'user'] },
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-user-scores/' +
				route.params.id +
				'/' +
				route.params.table +
				'/' +
				route.params.user
		);
	}

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

	routed($payload: any) {
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
