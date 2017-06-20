import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { BeforeRouteEnter } from '../../../../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { UserGameScore } from '../../../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { GameScoreTable } from '../../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { RouteState, RouteStore } from '../../../../manage.state';
import { ModalConfirm } from '../../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppJolticon } from '../../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { date } from '../../../../../../../../../lib/gj-lib-client/vue/filters/date';

@View
@Component({
	components: {
		AppJolticon,
	},
	filters: {
		number,
		date,
	},
})
export default class RouteDashGamesManageApiScoreboardsScoresView extends Vue {
	@RouteState game: RouteStore['game'];

	score: UserGameScore = null as any;
	scoreTable: GameScoreTable = null as any;

	@BeforeRouteEnter()
	routeEnter(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/scores/' +
				route.params.id +
				'/' +
				route.params.score
		);
	}

	routed() {
		Meta.title = this.$gettextInterpolate('Score Details - %{ game }', {
			game: this.game.title,
		});

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
