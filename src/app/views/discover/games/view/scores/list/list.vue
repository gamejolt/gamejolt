<template>
	<div class="route-discover-games-view-scores-list" v-if="isRouteBootstrapped">
		<section class="section">
			<div class="container">
				<app-scoreboard-selector
					v-if="Screen.isMobile && scoreTables.length > 1"
					:current-table="scoreTable"
					:tables="scoreTables"
					@select="changeTable"
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

						<app-nav-tab-list v-if="app.user">
							<ul>
								<li>
									<router-link
										:to="{
											name: 'discover.games.view.scores.list',
											params: Object.assign({}, $route.params, { type: 'best' }),
										}"
										active-class="active"
										v-app-no-autoscroll="true"
									>
										<translate>game.scores.best_tab</translate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{
											name: 'discover.games.view.scores.list',
											params: Object.assign({}, $route.params, { type: 'user' }),
										}"
										active-class="active"
										v-app-no-autoscroll="true"
									>
										<translate>game.scores.user_tab</translate>
									</router-link>
								</li>
							</ul>
						</app-nav-tab-list>

						<!--
						When screen isn't XS, we split the scores out into two columns.
					-->
						<app-loading-fade :is-loading="isRouteLoading">
							<div class="row" v-if="!Screen.isXs">
								<div class="col-sm-6">
									<app-score-list :scores="scoresLeft" :step="2" />
								</div>
								<div class="col-sm-6">
									<app-score-list :scores="scoresRight" :start-rank="2" :step="2" />
								</div>
							</div>
						</app-loading-fade>

						<!--
						When screen is XS we just show as one long list.
					-->
						<app-loading-fade :is-loading="isRouteLoading">
							<app-score-list :scores="scores" v-if="Screen.isXs" />
						</app-loading-fade>

						<div class="alert alert-notice full-bleed-xs" v-if="!scores.length">
							<template v-if="type === 'best'">
								<translate>game.scores.no_scores_html</translate>
							</template>
							<template v-else-if="type === 'user'">
								<translate>game.scores.no_user_scores_html</translate>
							</template>
						</div>
					</div>

					<!--
					On larger screens we show the score board selector to the right.
				-->
					<div class="col-md-4" v-if="Screen.isDesktop && scoreTables.length > 1">
						<!--
						We put some extra spacing in here because of the affixed game header.
					-->
						<app-scroll-affix :scroll-offset="80">
							<div class="score-tables-list">
								<div class="list-group">
									<router-link
										class="list-group-item"
										v-for="table of scoreTables"
										:key="table.id"
										:to="{
											name: 'discover.games.view.scores.list',
											params: Object.assign({}, $route.params, { tableId: table.id }),
										}"
										:class="{ active: table.id === scoreTable.id }"
										v-app-no-autoscroll
									>
										<h5 class="list-group-item-heading sans-margin-bottom">
											<strong>{{ table.name }}</strong>
										</h5>
										<p class="list-group-item-text">
											{{ table.description }}
										</p>
									</router-link>
								</div>
							</div>
						</app-scroll-affix>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.route-discover-games-view-scores-list
	// Put some extra spacing in here because of the affixed game header.
	.gj-scroll-affixed .score-tables-list
		margin-top: $shell-top-nav-height + 10px !important

	.score-tables-list
		.list-group-item-text
			text-overflow()
</style>

<script lang="ts" src="./list" />
