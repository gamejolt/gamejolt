<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { formatNumber } from '../../../../_common/filters/number';
import { GameModel } from '../../../../_common/game/game.model';
import { GameScoreTableModel } from '../../../../_common/game/score-table/score-table.model';
import { Popper } from '../../../../_common/popper/popper.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { UserGameScoreModel } from '../../../../_common/user/game-score/game-score.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppScoreList from '../list/list.vue';
import AppScoreboardSelector from '../scoreboard-selector/scoreboard-selector.vue';

@Options({
	components: {
		AppTimeAgo,
		AppScoreboardSelector,
		AppScoreList,
		AppUserAvatar,
	},
})
export default class AppScoreOverview extends Vue {
	@Prop(Object)
	game!: GameModel;
	@Prop(Object)
	initialPayload?: any;
	@Prop({ type: String, default: 'full' })
	size!: 'full' | 'small';

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	scoreTables: GameScoreTableModel[] = [];
	scoreTable: GameScoreTableModel | null = null;
	scores: UserGameScoreModel[] = [];
	userBestScore: UserGameScoreModel | null = null;
	userScorePlacement = 0;
	userScoreExperience = 0;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	// Even.
	get scoresLeft() {
		return this.scores.filter((_score, i) => i % 2 === 0);
	}

	// Odd.
	get scoresRight() {
		return this.scores.filter((_score, i) => i % 2 === 1);
	}

	created() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		} else {
			this.changeTable();
		}
	}

	@Watch('initialPayload')
	onChange() {
		if (this.initialPayload) {
			this.processPayload(this.initialPayload);
		}
	}

	private processPayload(payload: any) {
		this.scoreTables = payload.scoreTables
			? GameScoreTableModel.populate(payload.scoreTables)
			: [];
		this.scoreTable = payload.scoreTable ? new GameScoreTableModel(payload.scoreTable) : null;
		this.scores = payload.scores ? UserGameScoreModel.populate(payload.scores) : [];
		this.userBestScore = payload.scoresUserBestScore
			? new UserGameScoreModel(payload.scoresUserBestScore)
			: null;
		this.userScorePlacement = payload.scoresUserScorePlacement || 0;
		this.userScoreExperience = payload.scoresUserScoreExperience || 0;
	}

	async changeTable(table?: GameScoreTableModel) {
		Popper.hideAll();

		// Only if not current table.
		if (table && this.scoreTable && table.id === this.scoreTable.id) {
			return;
		}

		let url = '/web/discover/games/scores/overview/' + this.game.id;
		if (table) {
			url += '/' + table.id;
		}

		const payload = await Api.sendRequest(url);
		this.processPayload(payload);
	}
}
</script>

<template>
	<div>
		<!-- Scoreboard info/selector. -->
		<div class="row">
			<div class="col-xs-12" :class="size === 'full' ? 'col-lg-6' : ''">
				<h2 class="section-header sans-margin-top">
					<router-link
						class="link-unstyled"
						:to="{
							name: 'discover.games.view.scores.list',
							params: {
								slug: game.slug,
								id: game.id,
								tableId: scoreTable?.id,
								type: 'best',
							},
						}"
					>
						<AppTranslate>Scoreboards</AppTranslate>
					</router-link>
					<small v-if="scoreTables.length > 1">
						({{ formatNumber(scoreTables.length) }})
					</small>
				</h2>

				<hr class="underbar" />
			</div>

			<div class="col-xs-12" :class="size === 'full' ? 'col-lg-6' : ''">
				<AppScoreboardSelector
					v-if="scoreTables.length > 1"
					:current-table="scoreTable"
					:tables="scoreTables"
					@select="changeTable"
				/>
			</div>
		</div>

		<div class="row">
			<!--
			User Best Score
			Only show if logged in.
			-->
			<div v-if="app.user" class="col-xs-12" :class="size === 'full' ? 'col-lg-6' : ''">
				<div class="score-overview-user-best">
					<h4 class="section-header">
						<AppTranslate>Your Best Score</AppTranslate>
					</h4>

					<div class="row">
						<div class="col-sm-3 hidden-xs">
							<AppUserAvatar :user="app.user" />
						</div>

						<div
							:key="scoreTable?.id"
							class="col-xs-12 col-sm-9 anim-fade-in-right no-animate-leave no-animate-xs"
						>
							<div v-if="!userBestScore" class="alert full-bleed-xs">
								<p>
									<strong>
										<AppTranslate>You Haven't Scored Yet!</AppTranslate>
									</strong>
								</p>
								<p>
									<AppTranslate> What'cha waitin' for? Get gaming! </AppTranslate>
								</p>
							</div>

							<div
								v-if="userBestScore"
								class="well fill-darkest clearfix full-bleed-xs"
							>
								<div class="stat-big stat-big-smaller pull-right text-right">
									<div class="stat-big-digit stat-big-highlight">
										#{{ formatNumber(userScorePlacement) }}
									</div>
									<div class="stat-big-label">Current Rank</div>
								</div>

								<h4 class="sans-margin">{{ userBestScore.score }}</h4>
								<div>
									<span class="text-muted">
										<AppTimeAgo :date="userBestScore.logged_on" />
									</span>
								</div>
								<br />

								<div>
									<AppJolticon icon="exp" class="text-muted middle" />
									{{ formatNumber(userScoreExperience || 0) }}
									<span class="initialism">
										<AppTranslate
											translate-comment="As in abbreviation for experience. If one doesnt exist for your language, or if its not a short word just leave it as EXP."
										>
											EXP
										</AppTranslate>
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!--
			Top Scores
			If we're showing this full-size, then we pull this bit to the right on MD-up.
			This will collapse the row a bit so it's not really long.
			-->
			<div class="col-xs-12" :class="size === 'full' ? 'col-lg-6 pull-right' : ''">
				<div class="score-overview-top">
					<h4
						:class="{
							'section-header': !app.user || (Screen.isDesktop && size === 'full'),
						}"
					>
						<AppTranslate>Best Scores</AppTranslate>
					</h4>

					<template v-if="scores.length">
						<!--
						When screen isn't XS, we split the scores out into two columns.
						-->
						<div v-if="!Screen.isXs" class="row">
							<div class="col-sm-6">
								<AppScoreList :scores="scoresLeft" :step="2" />
							</div>
							<div class="col-sm-6">
								<AppScoreList :scores="scoresRight" :start-rank="2" :step="2" />
							</div>
						</div>

						<!--
						When screen is XS we just show as one long list.
						-->
						<AppScoreList v-if="Screen.isXs" :scores="scores" />

						<AppButton
							block-xs
							:to="{
								name: 'discover.games.view.scores.list',
								params: {
									slug: game.slug,
									id: game.id,
									tableId: scoreTable?.id,
									type: 'best',
								},
							}"
						>
							<AppTranslate>View Full Scoreboard</AppTranslate>
						</AppButton>
					</template>
					<div v-else class="alert full-bleed-xs">
						<AppTranslate>There are no scores on this scoreboard yet.</AppTranslate>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.score-overview-user-best
	.well
	.alert
		position: relative
		margin-bottom: 0

	@media $media-sm-up
		.alert::before
			caret(var(--theme-bg-offset), size: 9px)
			content: ''

		.well::before
			caret(var(--theme-darkest), size: 9px)
			content: ''
</style>
