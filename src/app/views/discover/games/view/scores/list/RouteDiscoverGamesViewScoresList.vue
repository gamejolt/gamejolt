<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../../../_common/api/api.service';
import { GameScoreTableModel } from '../../../../../../../_common/game/score-table/score-table.model';
import AppLoadingFade from '../../../../../../../_common/loading/AppLoadingFade.vue';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import { Popper } from '../../../../../../../_common/popper/popper.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/AppScrollAffix.vue';
import { vAppNoAutoscroll } from '../../../../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import { UserGameScoreModel } from '../../../../../../../_common/user/game-score/game-score.model';
import AppScoreList from '../../../../../../components/score/list/list.vue';
import AppScoreboardSelector from '../../../../../../components/score/scoreboard-selector/scoreboard-selector.vue';
import { useGameRouteController } from '../../view.vue';

export default {
	...defineAppRouteOptions({
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
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const { game } = useGameRouteController()!;
const { user } = useCommonStore();

const scoreTables = ref<GameScoreTableModel[]>([]);
const scoreTable = ref<GameScoreTableModel | null>(null);
const scores = ref<UserGameScoreModel[]>([]);
let userScorePlacement = 0;
let userScoreExperience = 0;
let userBestScore: UserGameScoreModel | null = null;

const type = computed(() => route.params.type as 'user' | 'best');
// Even.
const scoresLeft = computed(() => scores.value.filter((_score, i) => i % 2 === 0));
// Odd.
const scoresRight = computed(() => scores.value.filter((_score, i) => i % 2 === 1));

function changeTable(table: GameScoreTableModel) {
	Scroll.shouldAutoScroll = false;

	router.push({
		name: 'discover.games.view.scores.list',
		params: { tableId: table.id + '' },
	});

	Popper.hideAll();
}

const { isLoading } = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext(`Scores for %{ game }`, {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		scoreTables.value = GameScoreTableModel.populate(payload.scoreTables);
		scoreTable.value = payload.scoreTable ? new GameScoreTableModel(payload.scoreTable) : null;
		scores.value = UserGameScoreModel.populate(payload.scores);
		userBestScore = payload.scoresUserBestScore
			? new UserGameScoreModel(payload.scoresUserBestScore)
			: null;
		userScorePlacement = payload.scoresUserScorePlacement || 0;
		userScoreExperience = payload.scoresUserScoreExperience || 0;
	},
});
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

						<AppNavTabList v-if="user">
							<ul>
								<li>
									<RouterLink
										v-app-no-autoscroll="true"
										:to="{
											name: 'discover.games.view.scores.list',
											params: { ...route.params, type: 'best' },
										}"
										active-class="active"
									>
										{{ $gettext(`All Scores`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										v-app-no-autoscroll="true"
										:to="{
											name: 'discover.games.view.scores.list',
											params: Object.assign({}, route.params, {
												type: 'user',
											}),
										}"
										active-class="active"
									>
										{{ $gettext(`Your Scores`) }}
									</RouterLink>
								</li>
							</ul>
						</AppNavTabList>

						<!--
							When screen isn't XS, we split the scores out into two columns.
						-->
						<AppLoadingFade :is-loading="isLoading">
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
						<AppLoadingFade :is-loading="isLoading">
							<AppScoreList v-if="Screen.isXs" :scores="scores" />
						</AppLoadingFade>

						<div v-if="!scores.length" class="alert alert-notice full-bleed-xs">
							<template v-if="type === 'best'">
								{{ $gettext(`There are no scores on this scoreboard yet.`) }}
							</template>
							<template v-else-if="type === 'user'">
								{{ $gettext(`You don't have any scores here yet!`) }}
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
