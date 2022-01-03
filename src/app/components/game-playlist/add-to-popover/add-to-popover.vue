<script lang="ts" src="./add-to-popover"></script>

<template>
	<div class="add-to-playlist-popover">
		<app-loading v-if="isLoading" :centered="true" />
		<template v-else>
			<div class="list-group list-group-dark">
				<a class="list-group-item has-icon" @click="addToNewPlaylist">
					<app-jolticon icon="add" />
					<translate>library.playlists.add_to.new_playlist_button</translate>
				</a>
				<div v-if="playlists.length" class="list-group-item">
					<input
						v-model="filterQuery"
						v-app-focus-when
						type="search"
						class="form-control"
						:placeholder="$gettext('library.playlists.add_to.filter_placeholder')"
						keydown.esc.stop="close"
					/>
				</div>
			</div>
			<div
				v-if="playlists.length"
				class="list-group list-group-dark thin add-to-playlist-popover-playlists"
			>
				<a
					v-for="playlist of filteredPlaylists"
					:key="playlist.id"
					class="list-group-item has-icon"
					:class="
						playlistsWithGame.indexOf(playlist.id) === -1
							? 'playlist-no-game'
							: 'playlist-has-game'
					"
					@click="selectPlaylist(playlist)"
				>
					<app-jolticon icon="playlist" />
					<app-jolticon icon="check" />
					<app-jolticon icon="remove" />
					<app-jolticon icon="add" />
					{{ playlist.name }}
				</a>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.add-to-playlist-popover
	.loading
		margin-top: $line-height-computed

	.list-group
		margin-bottom: 0 !important

	&-playlists
		.jolticon
			display: none

		.list-group-item
			&.playlist-no-game
				.jolticon-playlist
					display: inline-block

				&:hover
					.jolticon-playlist
						display: none

					.jolticon-add
						theme-prop('color', 'highlight')
						display: inline-block

			&.playlist-has-game
				.jolticon-check
					theme-prop('color', 'highlight')
					display: inline-block

				&:hover
					.jolticon-check
						display: none

					.jolticon-remove
						theme-prop('color', 'notice')
						display: inline-block
</style>
