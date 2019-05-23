<template>
	<section class="section">
		<app-page-container xl>
			<div slot="left">
				<app-user-card v-if="Screen.isDesktop" :user="app.user" />

				<template v-if="hasGamesSection">
					<h4 class="section-header">
						<translate>Manage Games</translate>
					</h4>

					<template v-if="hasGameFilter">
						<div>
							<input
								type="search"
								class="form-control"
								:placeholder="$gettext(`Filter games`)"
								v-model="gameFilterQuery"
							/>
						</div>
						<br />
					</template>

					<nav class="-game-list platform-list">
						<ul>
							<li v-for="game of filteredGames" :key="game.id">
								<router-link
									:to="{
										name: 'dash.games.manage.game.overview',
										params: { id: game.id },
									}"
									:title="(game.ownerName ? `@${game.ownerName}/` : '') + game.title"
									v-app-track-event="`activity:quick-game`"
								>
									<template v-if="game.ownerName">
										<small>@{{ game.ownerName }}</small>
										/
									</template>
									{{ game.title }}
								</router-link>
							</li>
						</ul>
					</nav>

					<p v-if="isShowAllGamesVisible">
						<a
							class="link-muted"
							@click="isShowingAllGames = !isShowingAllGames"
							v-app-track-event="`activity:quick-game-all`"
						>
							<translate>Show all</translate>
						</a>
					</p>
				</template>
			</div>

			<div slot="right" v-if="!Screen.isMobile">
				<app-broadcast-card v-if="latestBroadcast" :post="latestBroadcast" />

				<app-home-recommended
					v-if="shouldShowRecommendedUsers"
					:users="recommendedUsers"
					:loading="loadingRecommendedUsers"
					@refresh="onRecommendedUsersRefresh"
				/>

				<app-scroll-affix>
					<div class="-ad">
						<app-ad-playwire-video />
					</div>
				</app-scroll-affix>
			</div>

			<app-post-add-button @add="onPostAdded" />

			<template v-if="Screen.isXs && communities.length > 0">
				<h6 class="-communities-heading">
					<translate>Communities</translate>
				</h6>

				<app-community-slider :communities="communities" />

				<div class="-spacer" />
			</template>

			<app-broadcast-card v-if="latestBroadcast && Screen.isMobile" :post="latestBroadcast" />

			<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
			<template v-else>
				<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
					<p class="lead">
						<translate>
							You don't have any activity yet. Follow games to stay up to date on their latest
							development!
						</translate>
					</p>

					<router-link
						:to="{
							name: 'discover.home',
						}"
						v-app-track-event="`activity:main-menu:discover`"
					>
						<app-button icon="compass-needle" solid lg>
							<translate>Explore</translate>
						</app-button>
					</router-link>
				</div>
				<app-activity-feed
					v-else
					:feed="feed"
					show-ads
					:new-count="unreadActivityCount"
					@load-new="loadedNew()"
				/>
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-game-list
	a
		text-overflow()

.-spacer
	spacer()

// Keep things tight since it's on mobile.
.-communities-heading
	margin-top: 0
	margin-bottom: 5px

.-ad
	width: 300px
	margin-bottom: $line-height-computed
</style>

<script lang="ts" src="./feed"></script>
