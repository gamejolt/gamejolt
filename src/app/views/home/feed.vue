<script lang="ts" src="./feed"></script>

<template>
	<section class="section fill-backdrop">
		<app-page-container xl>
			<template #left>
				<app-user-card v-if="Screen.isDesktop" :user="user" />

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

			<app-post-add-button @add="onPostAdded" />

			<template v-if="Screen.isXs">
				<h6 class="-feed-heading">
					<translate>Communities</translate>
				</h6>

				<app-community-slider-placeholder v-if="!isRouteBootstrapped" :num="1" />
				<app-community-slider v-else :communities="communities" with-add-button />
			</template>

			<div class="full-bleed-xs">
				<app-nav-tab-list center>
					<ul>
						<li>
							<router-link
								:to="{
									name: 'home',
								}"
								active-class="active"
								exact
							>
								<translate>Following</translate>
							</router-link>
						</li>
						<li>
							<router-link
								:to="{
									name: 'home',
									params: { tab: 'fyp' },
								}"
								active-class="active"
								exact
							>
								<translate>For You</translate>
								&nbsp;
								<span class="tag tag-notice">
									<translate>Beta</translate>
								</span>
							</router-link>
						</li>
					</ul>
				</app-nav-tab-list>
			</div>

			<route-home-activity v-if="feedTab === 'activity'" />
			<route-home-fyp v-else-if="feedTab === 'fyp'" />
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
</style>
