import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import AppLoadingFade from 'game-jolt-frontend-lib/components/loading/fade/fade.vue';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { AppNoAutoscroll } from 'game-jolt-frontend-lib/components/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { UserGameScore } from 'game-jolt-frontend-lib/components/user/game-score/game-score.model';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppScoreList from '../../../../../../components/score/list/list.vue';
import AppScoreboardSelector from '../../../../../../components/score/scoreboard-selector/scoreboard-selector.vue';
import { Store } from '../../../../../../store/index';
import { RouteStore, RouteStoreModule } from '../../view.store';

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
@RouteResolver({
	cache: true,
	deps: { params: ['tableId', 'type'], query: ['page'] },
	resolver({ route }) {
		let query = '';
		if (parseInt(route.query.page as string, 10) > 1) {
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
	},
})
export default class RouteDiscoverGamesViewScoresList extends BaseRouteComponent {
	@RouteStoreModule.State
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

	get type() {
		return this.$route.params.type as 'user' | 'best';
	}

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate(`Scores for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
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

		Popper.hideAll();
	}
}
