import Vue from 'vue';
import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./list.html?style=./list.styl';

import { RouteResolve } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../view.state';
import { GameScoreTable } from '../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { UserGameScore } from '../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppNoAutoscroll } from '../../../../../../../lib/gj-lib-client/components/scroll/auto-scroll/no-autoscroll.directive.vue';
import { AppScoreList } from '../../../../../../components/score/list/list';
import { AppScrollAffix } from '../../../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../../lib/gj-lib-client/utils/vue';
import { AppScoreboardSelector } from '../../../../../../components/score/scoreboard-selector/scoreboard-selector';
import { Popover } from '../../../../../../../lib/gj-lib-client/components/popover/popover.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Store } from '../../../../../../store/index';
import { AppLoadingFade } from '../../../../../../../lib/gj-lib-client/components/loading/fade/fade';

@View
@Component({
	components: {
		AppNavTabList,
		AppScoreList,
		AppScrollAffix,
		AppScoreboardSelector,
		AppLoadingFade,
	},
	directives: {
		AppNoAutoscroll,
	},
})
export default class RouteDiscoverGamesViewScoresList extends Vue {
	@Prop(String) type: 'best' | 'user';

	@RouteState game: RouteStore['game'];

	@State app: Store['app'];

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable | null = null;
	scores: UserGameScore[] = [];
	userBestScore: UserGameScore | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	Screen = makeObservableService(Screen);

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	@RouteResolve({ cache: true })
	beforeRoute(this: undefined, route: VueRouter.Route) {
		let query = '';
		if (parseInt(route.query.page, 10) > 1) {
			query = '?page=' + route.query.page;
		}

		const url =
			'/web/discover/games/scores' +
			'/' +
			route.params.id +
			'/' +
			route.params.tableId +
			'/' +
			route.params.type;

		return Api.sendRequest(url + query);
	}

	routed() {
		Meta.title = this.$gettextInterpolate(`Scores for %{ game }`, {
			game: this.game.title,
		});

		this.scoreTables = GameScoreTable.populate(this.$payload.scoreTables);
		this.scoreTable = this.$payload.scoreTable
			? new GameScoreTable(this.$payload.scoreTable)
			: null;
		this.scores = UserGameScore.populate(this.$payload.scores);
		this.userBestScore = this.$payload.scoresUserBestScore
			? new UserGameScore(this.$payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = this.$payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = this.$payload.scoresUserScoreExperience || 0;
	}

	changeTable(table: GameScoreTable) {
		Scroll.shouldAutoScroll = false;

		this.$router.push({
			name: 'discover.games.view.scores.list',
			params: { tableId: table.id + '' },
		});

		Popover.hideAll();
	}
}
