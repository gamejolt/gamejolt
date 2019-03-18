<template>
	<section v-if="hasSearch">
		<app-page-container no-left>
			<!-- Games -->
			<div slot="right" v-if="searchPayload.games.length">
				<h3 class="-heading">
					<app-button class="pull-right" trans :to="{ name: 'search.games', query: { q: query } }">
						<translate>View All</translate>
					</app-button>

					<router-link class="link-unstyled" :to="{ name: 'search.games', query: { q: query } }">
						<translate>search.results.games_heading</translate>
					</router-link>
					<small>({{ searchPayload.gamesCount | number }})</small>
				</h3>

				<app-game-grid
					v-if="Screen.isMobile"
					:games="searchPayload.games"
					force-scrollable
					event-label="search-overview-games"
				/>
				<app-game-list v-else :games="searchPayload.games" event-label="search-overview-games" />

				<div class="hidden-xs hidden-sm">
					<router-link class="link-muted" :to="{ name: 'search.games', query: { q: query } }">
						<translate>View all</translate>
					</router-link>
				</div>
			</div>

			<!-- Users -->
			<template v-if="searchPayload.users.length">
				<h3 class="-heading">
					<app-button class="pull-right" trans :to="{ name: 'search.users', query: { q: query } }">
						<translate>View All</translate>
					</app-button>

					<router-link class="link-unstyled" :to="{ name: 'search.users', query: { q: query } }">
						<translate>search.results.users_heading</translate>
					</router-link>
					<small>({{ searchPayload.usersCount | number }})</small>
				</h3>

				<div class="scrollable-grid-xs">
					<div class="row">
						<div
							class="scrollable-grid-item col-xs-10 col-sm-6"
							v-for="user of slicedUsers"
							:key="user.id"
						>
							<app-user-card :user="user" />
						</div>
					</div>
				</div>
			</template>

			<!-- Posts -->
			<template v-if="feed && feed.hasItems">
				<h3 class="-heading">
					<translate>Posts</translate>
				</h3>

				<app-activity-feed :feed="feed" show-ads />
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-heading
	clearfix()
	margin-top: $line-height-computed
</style>

<script lang="ts" src="./results" />
