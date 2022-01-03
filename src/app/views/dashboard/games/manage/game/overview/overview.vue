<script lang="ts" src="./overview"></script>

<template>
	<div>
		<div class="row">
			<div class="col-lg-8">
				<div v-if="game.isVisible" class="alert alert-highlight">
					<app-jolticon icon="check" />
					<translate>This game page is published to the site.</translate>
				</div>

				<!-- Show a little message if they still have builds being processed. -->
				<div v-if="hasBuildsProcessing" class="alert">
					<app-progress-poller
						:url="`/web/dash/developer/games/poll-build-progress/${game.id}`"
						@complete="onAllBuildsProcessed"
					/>

					<app-progress-bar thin active indeterminate :percent="100" />

					<p>
						<span v-translate>
							<strong>You still have builds that are being processed.</strong>
							They won't show on your game page until they're finished processing.
						</span>
					</p>
				</div>

				<app-expand :when="!game.isVisible && canPublish">
					<div class="alert alert-highlight">
						<p>
							<translate>
								Your game page is ready to publish to the site for all to see!
							</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								v-app-tooltip="
									$gettext(`dash.games.overview.todo_info_publish_button_tooltip`)
								"
								primary
								block
								@click="publish"
							>
								<translate>dash.games.overview.todo_info_publish_button</translate>
							</app-button>
						</app-game-perms>
					</div>
				</app-expand>

				<app-expand :when="game.canceled">
					<div class="alert">
						<p>
							<translate>
								Your game is set as being a canceled game. You can transition back
								to a normal game page at any time!
							</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								v-app-tooltip="$gettext(`This will make your game active again.`)"
								primary
								block
								@click="uncancel"
							>
								<translate>Uncancel Game</translate>
							</app-button>
						</app-game-perms>
					</div>
				</app-expand>
			</div>
		</div>

		<div v-if="game.community" class="row">
			<app-community-perms :community="game.community" tag="div">
				<div class="col-lg-8">
					<router-link :to="game.community.routeEditLocation">
						<app-button icon="users"> Edit Community </app-button>
					</router-link>
				</div>
			</app-community-perms>
		</div>

		<h2>
			<translate>dash.games.overview.stats_heading</translate>
		</h2>

		<div class="row">
			<div class="col-lg-8">
				<app-graph-widget
					class="-graph"
					:url="`/web/dash/developer/games/graphs/overview/${game.id}`"
				/>
			</div>
			<div class="col-lg-4">
				<div class="row">
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_views</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(viewCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_plays</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(downloadCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Likes</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(likeCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Avg. Rating</translate>
							</div>
							<div class="stat-big-digit">
								{{ averageRating }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_comments</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(commentCount) }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_followers</translate>
							</div>
							<div class="stat-big-digit">
								{{ formatNumber(game.follower_count) }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<app-game-perms required="analytics" tag="div" class="visible-xs">
			<app-button
				block
				icon="chart"
				:to="{
					name: 'dash.analytics',
					params: { resource: 'Game', resourceId: game.id },
				}"
			>
				<translate>View Game Analytics</translate>
			</app-button>
		</app-game-perms>
	</div>
</template>

<style lang="stylus" scoped>
.-graph
	::v-deep(.graph)
		rounded-corners-lg()
</style>
