import View from '!view!./list.html?style=./list.styl';
import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameScoreTable } from '../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { AppLoadingFade } from '../../../../../../../lib/gj-lib-client/components/loading/fade/fade';
import { AppNavTabList } from '../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { Popover } from '../../../../../../../lib/gj-lib-client/components/popover/popover.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollAffix } from '../../../../../../../lib/gj-lib-client/components/scroll/affix/affix';
import { AppNoAutoscroll } from '../../../../../../../lib/gj-lib-client/components/scroll/auto-scroll/no-autoscroll.directive.vue';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { UserGameScore } from '../../../../../../../lib/gj-lib-client/components/user/game-score/game-score.model';
import { AppScoreList } from '../../../../../../components/score/list/list';
import { AppScoreboardSelector } from '../../../../../../components/score/scoreboard-selector/scoreboard-selector';
import { Store } from '../../../../../../store/index';
import { RouteState, RouteStore } from '../../view.store';

@View
@Component({
	name: 'RouteDiscoverGamesViewScoresList',
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
export default class RouteDiscoverGamesViewScoresList extends BaseRouteComponent {
	@Prop(String)
	type!: 'best' | 'user';

	@RouteState
	game!: RouteStore['game'];

	@State
	app!: Store['app'];

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable | null = null;
	scores: UserGameScore[] = [];
	userBestScore: UserGameScore | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	readonly Screen = Screen;

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	@RouteResolve({ cache: true, reloadOnQueryChange: true })
	routeResolve(this: undefined, route: Route) {
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

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Scores for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.scoreTables = GameScoreTable.populate($payload.scoreTables);
		this.scoreTable = $payload.scoreTable ? new GameScoreTable($payload.scoreTable) : null;
		this.scores = UserGameScore.populate($payload.scores);
		this.userBestScore = $payload.scoresUserBestScore
			? new UserGameScore($payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = $payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = $payload.scoresUserScoreExperience || 0;
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
