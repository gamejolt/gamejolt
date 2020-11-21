<script lang="ts" src="./autocomplete"></script>

<template>
	<div class="search-autocomplete-popover">
		<div v-if="isHidden" class="well sans-margin-bottom">
			<app-jolticon icon="chevron-up" />
			<translate>Enter your search query for maximum finding...</translate>
		</div>
		<template v-else>
			<!-- View All -->
			<div class="list-group list-group-dark">
				<a
					class="list-group-item"
					:class="{ active: selected === 0 }"
					@mousedown="viewAll()"
				>
					<translate>search.autocomplete.show_all</translate>
				</a>
			</div>

			<!-- Installed Games -->
			<template v-if="libraryGames.length">
				<div class="popper-heading">
					<translate>search.autocomplete.installed_heading</translate>
				</div>
				<div class="list-group list-group-dark thin">
					<router-link
						v-for="libraryGame of libraryGames"
						:key="libraryGame.id"
						v-app-track-event="`search:autocomplete:go-library-game`"
						class="list-group-item"
						:to="{
							name: 'discover.games.view.overview',
							params: { slug: libraryGame.slug, id: libraryGame.id },
						}"
						:class="{ active: items[selected - 1] === libraryGame }"
					>
						<span class="search-game-thumbnail">
							<app-game-thumbnail-img :game="libraryGame" />
						</span>

						{{ libraryGame.title }}
					</router-link>
				</div>
			</template>

			<!-- Games -->
			<template v-if="games.length">
				<div class="popper-heading">
					<translate>search.autocomplete.games_heading</translate>
				</div>
				<div class="list-group list-group-dark thin">
					<router-link
						v-for="game of games"
						:key="game.id"
						v-app-track-event="`search:autocomplete:go-game`"
						class="list-group-item"
						:to="{
							name: 'discover.games.view.overview',
							params: { slug: game.slug, id: game.id },
						}"
						:class="{ active: items[selected - 1] === game }"
					>
						<div class="pull-right">
							<app-game-compat-icons :game="game" />
						</div>

						<span class="search-game-thumbnail">
							<app-game-thumbnail-img :game="game" />
						</span>

						{{ game.title }}
					</router-link>
				</div>
			</template>

			<!-- Users -->
			<template v-if="users.length">
				<div class="popper-heading">
					<translate>search.autocomplete.users_heading</translate>
				</div>
				<div class="list-group list-group-dark thin">
					<router-link
						v-for="user of users"
						:key="user.id"
						v-app-track-event="`search:autocomplete:go-user`"
						class="list-group-item"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
						:class="{ active: items[selected - 1] === user }"
					>
						<img :src="user.img_avatar" class="search-user-avatar" alt="" />
						{{ user.display_name }}
						<app-user-verified-tick :user="user" small />
						<span class="tiny text-muted">@{{ user.username }}</span>
					</router-link>
				</div>
			</template>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.search-autocomplete-popover
	.search-user-avatar
	.search-game-thumbnail
		float: left
		margin-right: 10px
		background-color: $dark-theme-bg-offset
		border: 0

	.search-game-thumbnail
		&
		& > img
			height: 20px
			width: @height * (16 / 9)

	.search-user-avatar
		width: 20px
		height: 20px
		border-radius: 50%

	.game-compat-icons
		margin-right: 15px

	.progress
		display: inline-block
		margin: 0
		width: 75px
		vertical-align: middle

		@media $media-md
			width: 100px

		@media $media-lg
			width: 150px

	.client-game-buttons
		.tag
			margin: 0

		// In list-group-items this gets floated.
		.tag-notice
			float: none

	.client-install-progress-info
		display: none

	.client-install-progress
		display: inline-block
</style>
