<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { GameScoreTable } from '../../../../../../../_common/game/score-table/score-table.model';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/tab-list.vue';
import { Popper } from '../../../../../../../_common/popper/popper.service';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/AppScrollAffix.vue';
import { vAppNoAutoscroll } from '../../../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { UserGameScore } from '../../../../../../../_common/user/game-score/game-score.model';
import AppScoreList from '../../../../../../components/score/list/list.vue';
import AppScoreboardSelector from '../../../../../../components/score/scoreboard-selector/scoreboard-selector.vue';
import { useGameRouteController } from '../../view.vue';

@Options({
	name: 'RouteDiscoverGamesViewScoresList',
	components: {
		AppNavTabList,
		AppScoreList,
		AppScrollAffix,
		AppScoreboardSelector,
		AppLoadingFade,
	},
	directives: {
		AppNoAutoscroll: vAppNoAutoscroll,
	},
})
@OptionsForRoute({
	cache: true,
	deps: { params: ['tableId', 'type'], query: ['page'] },
	resolver({ route }) {
		let query = '';
		if (parseInt(route.query.page as string, 10) > 1) {
			query = '?page=' + route.query.page;
		}

		const url =
			'/web/discover/games/scores/' +
			route.params.id +
			'/' +
			route.params.tableId +
			'/' +
			route.params.type;

		return Api.sendRequest(url + query);
	},
})
export default class RouteDiscoverGamesViewScoresList extends BaseRouteComponent {
	routeStore = setup(() => useGameRouteController()!);
	commonStore = setup(() => useCommonStore());

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable | null = null;
	scores: UserGameScore[] = [];
	userBestScore: UserGameScore | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	readonly Screen = Screen;

	get game() {
		return this.routeStore.game;
	}

	get app() {
		return this.commonStore;
	}

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

	routeResolved(payload: any) {
		this.scoreTables = GameScoreTable.populate(payload.scoreTables);
		this.scoreTable = payload.scoreTable ? new GameScoreTable(payload.scoreTable) : null;
		this.scores = UserGameScore.populate(payload.scores);
		this.userBestScore = payload.scoresUserBestScore
			? new UserGameScore(payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = payload.scoresUserScoreExperience || 0;
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
</script>

<template>
	<div v-if="scoreTable" class="route-discover-games-view-scores-list">
		<section class="section">
			<div class="container">
				<AppScoreboardSelector
					v-if="Screen.isMobile && scoreTables.length > 1"
					:current-table="scoreTable"
					:tables="scoreTables"
					@select="changeTable($event)"
				/>

				<div class="row">
					<div class="col-md-8">
						<h2 class="section-header sans-margin-bottom">
							{{ scoreTable.name }}
						</h2>
						<p class="text-muted">
							{{ scoreTable.description }}
						</p>
						<br />

						<AppNavTabList v-if="app.user">
							<ul>
								<li>
									<router-link
										v-app-no-autoscroll="true"
										:to="{
											name: 'discover.games.view.scores.list',
											params: { ...$route.params, type: 'best' },
										}"
										active-class="active"
									>
										<AppTranslate>All Scores</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										v-app-no-autoscroll="true"
										:to="{
											name: 'discover.games.view.scores.list',
											params: Object.assign({}, $route.params, {
												type: 'user',
											}),
										}"
										active-class="active"
									>
										<AppTranslate>Your Scores</AppTranslate>
									</router-link>
								</li>
							</ul>
						</AppNavTabList>

						<!--
							When screen isn't XS, we split the scores out into two columns.
						-->
						<AppLoadingFade :is-loading="isRouteLoading">
							<div v-if="!Screen.isXs" class="row">
								<div class="col-sm-6">
									<AppScoreList :scores="scoresLeft" :step="2" />
								</div>
								<div class="col-sm-6">
									<AppScoreList :scores="scoresRight" :start-rank="2" :step="2" />
								</div>
							</div>
						</AppLoadingFade>

						<!--
							When screen is XS we just show as one long list.
						-->
						<AppLoadingFade :is-loading="isRouteLoading">
							<AppScoreList v-if="Screen.isXs" :scores="scores" />
						</AppLoadingFade>

						<div v-if="!scores.length" class="alert alert-notice full-bleed-xs">
							<template v-if="type === 'best'">
								<AppTranslate>
									There are no scores on this scoreboard yet.
								</AppTranslate>
							</template>
							<template v-else-if="type === 'user'">
								<AppTranslate>You don't have any scores here yet!</AppTranslate>
							</template>
						</div>
					</div>

					<!--
						On larger screens we show the score board selector to the right.
					-->
					<div v-if="Screen.isDesktop && scoreTables.length > 1" class="col-md-4">
						<!--
							We put some extra spacing in here because of the affixed game header.
						-->
						<AppScrollAffix :padding="80">
							<div class="-score-selector-nav">
								<AppScoreboardSelector
									:current-table="scoreTable"
									:tables="scoreTables"
									@select="changeTable($event)"
								/>
							</div>
						</AppScrollAffix>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
