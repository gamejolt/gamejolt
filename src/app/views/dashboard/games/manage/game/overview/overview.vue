<template>
	<div>
		<div class="row">
			<div class="col-lg-8">
				<div class="alert alert-highlight" v-if="game.is_published">
					<app-jolticon icon="check" />
					<translate>This game page is published to the site.</translate>
				</div>

				<!-- Show a little message if they still have builds being processed. -->
				<div class="alert" v-if="hasBuildsProcessing">
					<app-progress-poller
						:url="`/web/dash/developer/games/poll-build-progress/${game.id}`"
						@complete="onAllBuildsProcessed"
					/>

					<app-progress-bar thin active :percent="100" variant="striped" />

					<p>
						<app-jolticon icon="notice" />
						<span v-translate>
							<strong>You still have builds that are being processed.</strong>
							They won't show on your game page until they're finished processing.
						</span>
					</p>
				</div>

				<app-expand :when="!game.is_published && canPublish">
					<div class="alert alert-highlight">
						<p>
							<translate>Your game page is ready to publish to the site for all to see!</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								primary
								block
								v-app-tooltip="$gettext(`dash.games.overview.todo_info_publish_button_tooltip`)"
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
								Your game is set as being a canceled game. You can transition back to a normal game
								page at any time!
							</translate>
						</p>

						<app-game-perms required="all" tag="div" class="alert-actions">
							<app-button
								primary
								block
								v-app-tooltip="$gettext(`This will make your game active again.`)"
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
			<div class="col-lg-8">
				<router-link
					:to="{
						name: 'communities.view.overview.edit',
						params: { path: game.community.path, id: game.community.id },
					}"
				>
					<app-button icon="users">
						Edit Community
					</app-button>
				</router-link>
			</div>
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
								{{ viewCount | number }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_plays</translate>
							</div>
							<div class="stat-big-digit">
								{{ downloadCount | number }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Likes</translate>
							</div>
							<div class="stat-big-digit">
								<template>
									{{ likeCount | number }}
								</template>
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>Avg. Rating</translate>
							</div>
							<div class="stat-big-digit">
								<template>
									{{ averageRating }}
								</template>
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_comments</translate>
							</div>
							<div class="stat-big-digit">
								{{ commentCount | number }}
							</div>
						</div>
					</div>
					<div class="col-xs-6 col-sm-4 col-lg-6">
						<div class="stat-big">
							<div class="stat-big-label">
								<translate>dash.games.overview.stats_followers</translate>
							</div>
							<div class="stat-big-digit">
								{{ game.follower_count | number }}
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
@require '~styles/variables'
@require '~styles-lib/mixins'

.-graph
	>>> .graph
		rounded-corners-lg()

</style>

<script lang="ts" src="./overview"></script>
