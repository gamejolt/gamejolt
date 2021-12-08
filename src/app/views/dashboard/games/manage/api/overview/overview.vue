<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.api.overview.heading</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					The Game API lets you spice up your game with scoreboards, trophies, cloud data
					storage, session logging, and more.
				</translate>
			</p>
			<p>
				<translate>
					You can check the links below to see if the community has already written an API
					library or plugin for the engine/tool/language you use. Of course, you can
					always write one yourself and share it in the forums!
				</translate>
			</p>
			<p>
				<router-link class="link-help" :to="{ name: 'landing.game-api' }">
					<translate>dash.games.api.overview.page_help_link</translate>
				</router-link>
				<br />
				<router-link
					class="link-help"
					:to="{
						name: 'forums.channels.view',
						params: { name: 'gj-game-api', sort: 'active' },
					}"
				>
					<translate>dash.games.api.overview.page_forum_link</translate>
				</router-link>
			</p>
		</div>

		<h2 class="sans-margin-bottom">
			<translate>dash.games.api.overview.sessions_heading</translate>
		</h2>

		<p class="text-muted small">
			<translate>dash.games.api.overview.sessions_help</translate>
		</p>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.sessions_active_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveSessions) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.sessions_time_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.time || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.sessions_avg_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatDuration(sessionStats.avg || 0) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.sessions_users_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(sessionStats['user-count']) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.trophies.list' }"
			>
				<translate>dash.games.api.overview.trophies_heading</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.trophies_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numActiveTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.trophies_exp_label</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.trophies_exp_tooltip`)
								"
							/>
						</div>
						<div class="stat-big-digit">
							<template v-if="!numActiveTrophies">
								<translate>dash.games.api.overview.na</translate>
							</template>
							<template v-else>
								{{ formatNumber(totalTrophyExp) }}
								<translate>leveling.exp</translate>
							</template>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.trophies_achieved_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalAchievedTrophies) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.trophies_users_label</translate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalUsersWithTrophies) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.scoreboards.list' }"
			>
				<translate>dash.games.api.overview.scores_heading</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.scores_label</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.scores_tooltip`)
								"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalScores) }}
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.scores_users_label</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.scores_users_tooltip`)
								"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(totalUsersWithScores) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<h2>
			<router-link
				class="link-unstyled"
				:to="{ name: 'dash.games.manage.api.data-storage.items.list' }"
			>
				<translate>dash.games.api.overview.data_heading</translate>
			</router-link>
		</h2>

		<div class="well fill-offset full-bleed-xs sans-margin-bottom">
			<div class="row">
				<div class="col-xs-6 col-sm-3">
					<div class="stat-big stat-big-smaller sans-margin-bottom text-center">
						<div class="stat-big-label">
							<translate>dash.games.api.overview.data_items_label</translate>
							<app-jolticon
								icon="help-circle"
								v-app-tooltip.touchable="
									$gettext(`dash.games.api.overview.data_items_tooltip`)
								"
							/>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(numGlobalItems) }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./overview"></script>
