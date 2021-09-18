<script lang="ts" src="./results"></script>

<template>
	<section v-if="hasSearch">
		<!-- Communities -->
		<template v-if="searchPayload.communities.length">
			<section class="section section-thin">
				<div class="container">
					<h3 class="-heading">
						<app-button
							class="pull-right"
							trans
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							<translate>View All</translate>
						</app-button>

						<router-link
							class="link-unstyled"
							:to="{ name: 'search.communities', query: { q: query } }"
						>
							<translate>Communities</translate>
						</router-link>
						<small>({{ number(searchPayload.communitiesCount) }})</small>
					</h3>

					<div class="scrollable-grid-xs">
						<div class="row">
							<div
								v-for="community of slicedCommunities"
								:key="community.id"
								class="scrollable-grid-item col-xs-5 col-sm-2"
							>
								<app-community-thumbnail :community="community" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</template>

		<app-page-container no-left order="right,main">
			<!-- Games -->
			<div v-if="!Screen.isMobile && searchPayload.games.length" slot="right">
				<h3 class="-heading">
					<app-button
						class="pull-right"
						trans
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<translate>View All</translate>
					</app-button>

					<router-link
						class="link-unstyled"
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<translate>search.results.games_heading</translate>
					</router-link>
					<small>({{ number(searchPayload.gamesCount) }})</small>
				</h3>

				<app-game-grid
					v-if="Screen.isMobile"
					:games="searchPayload.games"
					force-scrollable
					event-label="search-overview-games"
				/>
				<app-game-list
					v-else
					:games="searchPayload.games"
					event-label="search-overview-games"
				/>

				<div class="hidden-xs hidden-sm">
					<router-link
						class="link-muted"
						:to="{ name: 'search.games', query: { q: query } }"
					>
						<translate>View all</translate>
					</router-link>
				</div>
			</div>

			<!-- Users -->
			<template v-if="searchPayload.users.length">
				<h3 class="-heading">
					<app-button
						class="pull-right"
						trans
						:to="{ name: 'search.users', query: { q: query } }"
					>
						<translate>View All</translate>
					</app-button>

					<router-link
						class="link-unstyled"
						:to="{ name: 'search.users', query: { q: query } }"
					>
						<translate>search.results.users_heading</translate>
					</router-link>
					<small>({{ number(searchPayload.usersCount) }})</small>
				</h3>

				<div class="scrollable-grid-xs">
					<div class="row">
						<div
							v-for="user of slicedUsers"
							:key="user.id"
							class="scrollable-grid-item col-xs-10 col-sm-6"
						>
							<app-user-card :user="user" elevate />
						</div>
					</div>
				</div>
			</template>

			<!-- Posts -->
			<template v-if="feed && feed.hasItems">
				<h3 class="-heading">
					<translate>Posts</translate>
				</h3>

				<app-activity-feed :feed="feed" />
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-heading
	clearfix()
	margin-top: $line-height-computed
</style>
