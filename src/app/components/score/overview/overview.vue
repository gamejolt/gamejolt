<template>
	<div>
		<!--
		Scoreboard info/selector.
	-->
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
								tableId: scoreTable.id,
								type: 'best',
							},
						}"
					>
						<translate>scores.overview.heading</translate>
					</router-link>
					<small v-if="scoreTables.length > 1">({{ scoreTables.length | number }})</small>
				</h2>

				<hr class="underbar" />
			</div>

			<div class="col-xs-12" :class="size === 'full' ? 'col-lg-6' : ''">
				<app-scoreboard-selector
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
			<div class="col-xs-12" :class="size === 'full' ? 'col-lg-6' : ''" v-if="app.user">
				<div class="score-overview-user-best">
					<h4 class="section-header">
						<translate>scores.overview.user_best_heading</translate>
					</h4>

					<div class="row">
						<div class="col-sm-3 hidden-xs">
							<app-user-avatar :user="app.user" />
						</div>

						<!-- Animation Scope -->
						<div
							v-for="_ of [scoreTable]"
							:key="_.id"
							class="col-xs-12 col-sm-9 anim-fade-in-right no-animate-leave no-animate-xs"
						>
							<div class="alert full-bleed-xs" v-if="!userBestScore">
								<p>
									<strong>
										<translate>scores.overview.user_best_none_heading</translate>
									</strong>
								</p>
								<p>
									<translate>
										What'cha waitin' for? Get gaming!
									</translate>
								</p>
							</div>

							<div class="well fill-darkest clearfix full-bleed-xs" v-if="userBestScore">
								<div class="stat-big stat-big-smaller pull-right text-right">
									<div class="stat-big-digit stat-big-highlight">
										#{{ userScorePlacement | number }}
									</div>
									<div class="stat-big-label">Current Rank</div>
								</div>

								<h4 class="sans-margin">{{ userBestScore.score }}</h4>
								<div>
									<span class="text-muted">
										<app-time-ago :date="userBestScore.logged_on" />
									</span>
								</div>
								<br />

								<div>
									<app-jolticon icon="exp" class="text-muted middle" />
									{{ (userScoreExperience || 0) | number }}
									<span class="initialism">
										<translate>leveling.exp</translate>
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
					<h4 :class="{ 'section-header': !app.user || (Screen.isDesktop && size === 'full') }">
						<translate>scores.overview.top_scores_heading</translate>
					</h4>

					<template v-if="scores.length">
						<!--
						When screen isn't XS, we split the scores out into two columns.
					-->
						<div class="row" v-if="!Screen.isXs">
							<div class="col-sm-6">
								<app-score-list :scores="scoresLeft" :step="2" />
							</div>
							<div class="col-sm-6">
								<app-score-list :scores="scoresRight" :start-rank="2" :step="2" />
							</div>
						</div>

						<!--
						When screen is XS we just show as one long list.
					-->
						<app-score-list :scores="scores" v-if="Screen.isXs" />

						<app-button
							blockXs
							:to="{
								name: 'discover.games.view.scores.list',
								params: {
									slug: game.slug,
									id: game.id,
									tableId: scoreTable.id,
									type: 'best',
								},
							}"
						>
							<translate>scores.overview.view_more_button</translate>
						</app-button>
					</template>
					<div class="alert full-bleed-xs" v-else>
						<translate>scores.overview.no_scores_html</translate>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.score-overview-user-best
	.well, .alert
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

<script lang="ts" src="./overview" />
