<template>
	<div v-if="collection">
		<app-page-header
			class="library-collection-header"
			:hide-nav="type === 'bundle'"
			:autoscroll-anchor-key="collection._id"
		>
			<div class="row collection-copy">
				<div class="col-sm-4 col-md-3" v-if="!Screen.isXs">
					<app-game-collection-thumbnail
						class="anim-fade-in-enlarge"
						v-for="collection of [collection]"
						:key="collection._id"
						:collection="collection"
					/>
				</div>
				<div class="col-sm-8 col-md-9">
					<transition mode="out-in" appear>
						<div
							class="anim-fade-enter-right anim-fade-leave-up"
							v-for="collection of [collection]"
							:key="collection._id"
						>
							<!--
							Followed Games
						-->
							<template v-if="type === 'followed'">
								<template v-if="collection.isOwner">
									<h1>
										<translate>Your Followed Games</translate>
									</h1>
									<p class="text-muted small">
										<translate>When you follow a game, it shows up here.</translate>
										<br />
										<translate>
											You'll receive notifications when developers post news about any games you're
											following.
										</translate>
									</p>
								</template>
								<template v-else>
									<h1>
										<translate>Games Followed</translate>
									</h1>
									<h4>
										<translate>by</translate>
										<router-link
											class="link-unstyled"
											:to="{ name: 'profile.overview', params: { username: user.username } }"
										>
											{{ user.display_name }}
										</router-link>
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<translate :translate-params="{ user: user.display_name }">
											These are the games that %{ user } is following.
										</translate>
									</p>
								</template>
							</template>

							<!--
							Developer Games
						-->
							<template v-else-if="type === 'developer'">
								<template v-if="collection.isOwner">
									<h1>
										<translate>Your Games</translate>
									</h1>
									<p class="text-muted small">
										<translate>
											These are the games that you've made or collaborated on. Be proud!
										</translate>
										<br />
										<translate>
											Feel free to share this page with others to show off your games.
										</translate>
									</p>
								</template>
								<template v-else>
									<h1>
										<translate>Games</translate>
									</h1>
									<h4>
										<translate>by</translate>
										<router-link
											class="link-unstyled"
											:to="{ name: 'profile.overview', params: { username: user.username } }"
										>
											{{ user.display_name }}
										</router-link>
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<translate :translate-params="{ user: user.display_name }">
											These are the games made by %{ user }.
										</translate>
									</p>
								</template>
							</template>

							<!--
							Owned Games
						-->
							<template v-else-if="type === 'owned'">
								<template v-if="collection.isOwner">
									<h1>
										<translate>Your Owned Games</translate>
									</h1>
									<p class="text-muted small">
										<translate>These are all the games you own.</translate>
									</p>
								</template>
								<template v-else>
									<h1>
										<translate>Games Owned</translate>
									</h1>
									<h4>
										<translate>by</translate>
										<router-link
											class="link-unstyled"
											:to="{ name: 'profile.overview', params: { username: user.username } }"
										>
											{{ user.display_name }}
										</router-link>
										<small>@{{ user.username }}</small>
									</h4>
									<p class="text-muted small">
										<translate :translate-params="{ user: user.display_name }">
											These are all the games owned by %{ user }.
										</translate>
									</p>
								</template>
							</template>

							<!--
							Recommended Games
						-->
							<template v-else-if="type === 'recommended'">
								<template v-if="collection.isOwner">
									<h1>
										<translate>Your Daily Mix</translate>
									</h1>
									<p class="text-muted small">
										<translate>
											Every day we pick a handful of games that we think you may like!
										</translate>
									</p>
								</template>
								<template v-else>
									<h1>
										<translate>Daily Mix</translate>
									</h1>
									<h4>
										<translate>for</translate>
										<router-link
											class="link-unstyled"
											:to="{ name: 'profile.overview', params: { username: user.username } }"
										>
											{{ user.display_name }}
										</router-link>
										<small>@{{ user.username }}</small>
									</h4>
								</template>
							</template>

							<!--
							Playlist
						-->
							<template v-else-if="type === 'playlist'">
								<h1>
									{{ playlist.name }}
								</h1>

								<h4 v-if="!collection.isOwner">
									<translate>by</translate>
									<router-link
										class="link-unstyled"
										:to="{ name: 'profile.overview', params: { username: playlist.user.username } }"
									>
										{{ playlist.user.display_name }}
									</router-link>
									<small>@{{ playlist.user.username }}</small>
								</h4>
							</template>

							<!--
							Bundle
						-->
							<template v-else-if="type === 'bundle'">
								<h1>{{ bundle.title }}</h1>
								<p class="text-muted small">{{ bundle.description }}</p>
							</template>

							<!--
							Jam
						-->
							<template v-else-if="type === 'jam'">
								<h1>{{ jam.name }}</h1>
								<p class="text-muted small">
									<translate :translate-params="{ jam: jam.name }">
										These are the jam games entered into %{ jam }.
									</translate>
								</p>
								<p>
									<app-button :href="jam.fullUrl" target="_blank">
										<translate>View Jam Page</translate>
									</app-button>
								</p>
							</template>
						</div>
					</transition>
				</div>
			</div>

			<template slot="nav">
				<ul class="stat-list">
					<li class="stat-big stat-big-smaller" v-if="shouldShowFollowers">
						<div class="stat-big-label">
							<translate>library.collection.followers_label</translate>
						</div>
						<div class="stat-big-digit">{{ followerCount | number }}</div>
					</li>
					<li class="stat-big stat-big-smaller">
						<div class="stat-big-label"><translate>library.collection.games_label</translate></div>
						<div class="stat-big-digit">{{ listing.gamesCount | number }}</div>
					</li>
				</ul>
			</template>

			<app-page-header-controls slot="controls">
				<!-- Following -->
				<app-game-collection-follow-widget
					v-if="shouldShowFollow"
					block
					:collection="collection"
					:follower-count="followerCount"
					@follow="++followerCount"
					@unfollow="--followerCount"
				/>
				<template v-else-if="type === 'playlist' && collection.isOwner">
					<!-- Editing Playlist -->
					<app-button block @click="editPlaylist(collection)">
						<translate>Edit Playlist</translate>
					</app-button>

					<!-- More options -->
					<app-popper slot="end">
						<app-button icon="ellipsis-v" circle trans />

						<div slot="popover" class="list-group list-group-dark">
							<a class="list-group-item has-icon" @click="removePlaylist(collection)">
								<app-jolticon icon="remove" notice />
								<translate>library.collection.remove_playlist_button</translate>
							</a>
						</div>
					</app-popper>
				</template>
			</app-page-header-controls>
		</app-page-header>

		<app-game-listing
			:listing="listing"
			:hide-section-nav="true"
			:is-loading="isRouteLoading"
			:show-footer-ad="false"
		>
			<app-game-grid v-if="listing" :games="listing.games" event-label="collection-games">
				<template slot="thumbnail-controls" scope="props">
					<app-button
						icon="remove"
						circle
						overlay
						v-if="type === 'playlist' && collection.isOwner"
						v-app-tooltip="$gettext(`library.collection.thumbnail_control_playlist_tooltip`)"
						@click="removeFromPlaylist(props.game)"
					/>

					<app-button
						icon="remove"
						circle
						overlay
						v-if="type === 'followed' && collection.isOwner"
						v-app-tooltip="$gettext(`library.collection.thumbnail_control_unfollow_tooltip`)"
						@click="removeFromLibrary(props.game)"
					/>
				</template>
			</app-game-grid>
		</app-game-listing>

		<section class="section" v-if="recommendedGames.length">
			<div class="container-xl">
				<div class="clearfix">
					<h1 class="section-header">
						<translate>Recommended Games</translate>
					</h1>
					<div :class="{ 'pull-left': !Screen.isXs }">
						<p>
							<translate>
								We remixed this playlist into a tasty collection of other games that you may enjoy.
							</translate>
						</p>
						<hr class="underbar" />
					</div>
					<div class="hidden-xs pull-right">
						<app-button @click="mixPlaylist(true)">
							<translate>Refresh</translate>
						</app-button>
					</div>
				</div>

				<app-loading-fade :is-loading="isLoadingRecommended">
					<app-game-grid
						:games="recommendedGames"
						:scrollable="true"
						event-label="collection-games-mix"
					/>
				</app-loading-fade>

				<p class="visible-xs">
					<app-button block @click="mixPlaylist(true)">
						<translate>Refresh</translate>
					</app-button>
				</p>
			</div>
		</section>

		<app-ad-placement pos="bottom" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.library-collection-header
	.collection-copy
		margin-bottom: $font-size-base

		h4
			theme-prop('color', 'fg-muted')
			margin-top: 0

		p
			margin-top: $font-size-base
			margin-bottom: 0

	@media $media-xs
		text-align: center
</style>

<script lang="ts" src="./collection" />
