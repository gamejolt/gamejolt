<script lang="ts" src="./feed"></script>

<template>
	<section class="section fill-backdrop">
		<app-page-container xl>
			<template #left>
				<app-user-card v-if="Screen.isDesktop" :user="app.user" />

				<template v-if="hasGamesSection">
					<h4 class="section-header">
						<translate>Manage Games</translate>
					</h4>

					<template v-if="hasGameFilter">
						<div>
							<input
								v-model="gameFilterQuery"
								type="search"
								class="form-control"
								:placeholder="$gettext(`Filter games`)"
							/>
						</div>
						<br />
					</template>

					<nav class="-game-list platform-list">
						<ul>
							<li v-for="game of filteredGames" :key="game.id">
								<router-link
									v-app-track-event="`activity:quick-game`"
									:to="{
										name: 'dash.games.manage.game.overview',
										params: { id: game.id },
									}"
									:title="
										(game.ownerName ? `@${game.ownerName}/` : '') + game.title
									"
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
							v-app-track-event="`activity:quick-game-all`"
							class="link-muted"
							@click="isShowingAllGames = !isShowingAllGames"
						>
							<translate>Show all</translate>
						</a>
					</p>
				</template>
			</template>

			<template v-if="!Screen.isMobile" #right>
				<app-home-recommended-game :game="featuredGame" :loading="loadingRecommendedData" />
				<app-home-recommended-users
					v-if="shouldShowRecommendedUsers"
					:users="recommendedUsers"
					:loading="loadingRecommendedUsers || loadingRecommendedData"
					@refresh="refreshRecommendedUsers"
				/>

				<app-scroll-affix>
					<div class="-ad">
						<app-ad-widget size="video" placement="side" />
					</div>
				</app-scroll-affix>
			</template>

			<template v-if="shouldShowBasement">
				<div
					style="
						display: flex;
						flex-direction: column;
						align-items: center;
						margin-bottom: 40px;
					"
				>
					<p class="lead text-center anim-fade-in-down" style="max-width: 550px">
						A creature grabbed all the candy people gave you and dashed into a door
						you've never seen before! It seems to lead to the Game Jolt Basement. I
						wonder what's down there...
					</p>

					<router-link to="basement">
						<img
							class="img-responsive anim-fade-in-enlarge"
							width="267"
							height="400"
							src="~img/halloween2020/door.png"
							alt="The Game Jolt Basement"
						/>
					</router-link>
				</div>
			</template>

			<app-post-add-button @add="onPostAdded" />

			<template v-if="Screen.isXs">
				<template v-if="loadingRecommendedData || !!featuredGame">
					<h6 class="-feed-heading">
						<translate>Featured Game</translate>
					</h6>
					<span
						v-if="loadingRecommendedData"
						class="lazy-placeholder -game-placeholder"
						:style="{ height: '67px' }"
					/>
					<app-game-badge
						v-else-if="featuredGame"
						class="-game-badge"
						:game="featuredGame"
					/>
				</template>

				<h6 class="-feed-heading">
					<translate>Communities</translate>
				</h6>

				<app-community-slider-placeholder v-if="!isRouteBootstrapped" :num="1" />
				<app-community-slider v-else :communities="communities" with-add-button />
			</template>

			<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
			<template v-else>
				<div v-if="!feed.hasItems" class="alert full-bleed-xs text-center">
					<p class="lead">
						<translate>
							You don't have any activity yet. Follow games to stay up to date on
							their latest development!
						</translate>
					</p>

					<router-link
						v-app-track-event="`activity:main-menu:discover`"
						:to="{
							name: 'discover.home',
						}"
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
					@load-new="onLoadedNew"
					@load-more="onLoadMore"
				/>
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-game-list
	a
		text-overflow()

// Keep things tight since it's on mobile.
.-feed-heading
	margin-top: 0
	margin-bottom: 5px

.-game-placeholder
	rounded-corners-lg()
	margin-bottom: $line-height-computed
</style>
