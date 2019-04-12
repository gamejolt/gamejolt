<template>
	<div>
		<nav class="platform-list inline">
			<ul>
				<li>
					<router-link
						:to="{ name: 'discover.games.view.overview' }"
						:class="{ active: $route.name === 'discover.games.view.overview' }"
					>
						<translate>games.view.overview_tab</translate>
					</router-link>
				</li>

				<li v-if="game.comments_enabled">
					<a @click="showComments()">
						<translate>Comments</translate>
						<span class="badge" v-if="commentsCount">
							{{ commentsCount | number }}
						</span>
					</a>
				</li>

				<li>
					<router-link :to="{ name: 'discover.games.view.followers' }" active-class="active">
						<translate>Followers</translate>
						<span class="badge">
							{{ game.follower_count | number }}
						</span>
					</router-link>
				</li>

				<li v-if="hasScores">
					<router-link
						:to="{
							name: 'discover.games.view.scores.list',
							params: {
								type: 'best',
								tableId: primaryScoreTable.id,
							},
						}"
						:class="{ active: $route.name === 'discover.games.view.scores.list' }"
					>
						<translate>games.view.scores_tab</translate>
					</router-link>
				</li>

				<li v-if="trophiesCount">
					<router-link :to="{ name: 'discover.games.view.trophies.list' }" active-class="active">
						<translate>games.view.trophies_tab</translate>
						<span class="badge">{{ trophiesCount | number }}</span>
					</router-link>
				</li>

				<li v-if="app.user">
					<app-popper>
						<a>
							<app-jolticon icon="ellipsis-h" />
						</a>

						<div slot="popover" class="list-group list-group-dark">
							<app-game-perms :game="game">
								<router-link
									class="list-group-item has-icon"
									:to="{
										name: 'dash.games.manage.game.overview',
										params: { id: game.id },
									}"
								>
									<app-jolticon icon="cog" />
									<translate>Manage Game</translate>
								</router-link>
							</app-game-perms>
							<a class="list-group-item has-icon" v-if="app.user && !hasAnyPerms" @click="report">
								<app-jolticon icon="flag" notice />
								<translate>games.view.report_game_button</translate>
							</a>
							<app-game-mod-links v-if="shouldShowModTools" :game="game" />
						</div>
					</app-popper>
				</li>
			</ul>
		</nav>
	</div>
</template>

<script lang="ts" src="./nav"></script>
