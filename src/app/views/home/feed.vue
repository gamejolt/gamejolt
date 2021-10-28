<script lang="ts" src="./feed"></script>

<template>
	<section class="section fill-backdrop">
		<app-page-container xl>
			<template #left>
				<template v-if="hasSimpleHome">
					<app-scroll-affix>
						<nav class="-menu">
							<ol>
								<li v-for="tab of tabs" :key="tab">
									<router-link
										v-if="tab === 'fyp'"
										:to="{
											name: 'home',
											params: { tab: HomeFeedService.fypTab },
										}"
										:class="{
											active: feedTab === 'fyp',
										}"
									>
										<app-jolticon class="-menu-icon" icon="home" />
										<translate>For You</translate>
									</router-link>
									<router-link
										v-if="tab === 'activity'"
										:to="{
											name: 'home',
											params: { tab: HomeFeedService.activityTab },
										}"
										:class="{
											active: feedTab === 'activity',
										}"
									>
										<app-jolticon class="-menu-icon" icon="friends" />
										<translate>Following</translate>
										<span
											v-if="hasUnreadActivity"
											class="-unread-tag anim-fade-enter anim-fade-leave"
										/>
									</router-link>
								</li>
								<template v-if="hasGamesSection && developerCollection">
									<li>
										<router-link
											:to="developerCollection.routeLocation"
											active-class="active"
										>
											<app-jolticon class="-menu-icon" icon="game" />
											<translate>Your Games</translate>
										</router-link>
									</li>
								</template>
							</ol>
						</nav>
					</app-scroll-affix>
				</template>
				<template v-else>
					<app-user-card v-if="Screen.isDesktop" :user="user" />

					<template v-if="hasGamesSection">
						<div class="clearfix">
							<div class="pull-right">
								<app-button
									v-app-tooltip="$gettext(`Add Game`)"
									icon="add"
									circle
									trans
									:to="{ name: 'dash.games.add' }"
								/>
							</div>
							<h4 class="section-header">
								<translate>Manage Games</translate>
							</h4>
						</div>

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
											(game.ownerName ? `@${game.ownerName}/` : '') +
											game.title
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
			</template>

			<template v-if="!Screen.isMobile" #right>
				<app-home-fireside
					:featured-fireside="featuredFireside"
					:user-fireside="userFireside"
					:firesides="firesides"
					:is-loading="isLoadingFiresides"
					:show-placeholders="!isFiresidesBootstrapped"
					@request-refresh="refreshFiresides()"
				/>
			</template>

			<div
				v-if="!GJ_IS_CLIENT"
				style="
					display: flex;
					flex-direction: column;
					align-items: center;
					margin-bottom: 40px;
				"
			>
				<p class="lead text-center anim-fade-in-down" style="max-width: 550px">
					A door appeared. It's locked.
					<br />
					I wonder what it could mean...
				</p>

				<div style="width: 150px">
					<img
						class="img-responsive anim-fade-in-enlarge"
						width="267"
						height="400"
						src="~img/halloween2020/door.png"
						alt="The Game Jolt Basement"
					/>
				</div>
			</div>

			<app-post-add-button @add="onPostAdded" />

			<template v-if="Screen.isXs">
				<h6 class="-feed-heading">
					<translate>Communities</translate>
				</h6>

				<app-community-slider-placeholder v-if="!isRouteBootstrapped" :num="1" />
				<app-community-slider v-else :communities="communities" with-add-button />
			</template>

			<app-home-fireside
				v-if="Screen.isMobile"
				:user-fireside="userFireside"
				:firesides="firesides"
				:is-loading="isLoadingFiresides"
				:show-placeholders="!isFiresidesBootstrapped"
				@request-refresh="refreshFiresides()"
			/>

			<div v-if="!hasSimpleHome" class="full-bleed-xs">
				<app-nav-tab-list center class="-inline-menu">
					<ul>
						<li v-for="tab of tabs" :key="tab">
							<router-link
								v-if="tab === 'activity'"
								:to="{
									name: 'home',
									params: { tab: HomeFeedService.activityTab },
								}"
								:class="{
									active: feedTab === 'activity',
								}"
							>
								<translate>Following</translate>
								<span
									v-if="hasUnreadActivity"
									class="-unread-tag anim-fade-enter anim-fade-leave"
								/>
							</router-link>
							<router-link
								v-if="tab === 'fyp'"
								:to="{
									name: 'home',
									params: { tab: HomeFeedService.fypTab },
								}"
								:class="{
									active: feedTab === 'fyp',
								}"
							>
								<translate>For You</translate>
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

.-concert
	margin-bottom: $line-height-computed

	@media $media-xs
		full-bleed-xs()

	@media $media-sm-up
		rounded-corners-lg()

.-menu
	margin-bottom: $line-height-computed
	margin-left: -8px
	margin-right: -8px
	max-width: 280px
	margin-left: auto

	ol
	li
		margin: 0
		padding: 0
		list-style: none

	a
		rounded-corners()
		padding-left: 8px
		padding-right: 8px
		display: flex
		flex-direction: row
		align-items: center
		height: 48px
		font-size: 18px
		font-weight: bold
		color: var(--theme-fg)

		&.active
			color: var(--theme-link)

		&:hover
			background-color: var(--theme-bg)

	&-icon
		font-size: 27px
		margin-right: 16px

	.-unread-tag
		margin-left: 12px

.-inline-menu
	.-unread-tag
		display: inline-block
		margin-left: 4px

.-unread-tag
	background-color: var(--theme-link)
	border-radius: 50%
	width: 12px
	height: 12px
	display: block

.-game-list
	a
		text-overflow()

// Keep things tight since it's on mobile.
.-feed-heading
	margin-top: 0
	margin-bottom: 5px
</style>
