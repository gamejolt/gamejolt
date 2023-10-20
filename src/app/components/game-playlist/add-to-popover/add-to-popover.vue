<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { vAppFocusWhen } from '../../../../_common/form-vue/focus-when.directive';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { stringSort } from '../../../../utils/array';
import { fuzzysearch } from '../../../../utils/string';
import { shallowSetup } from '../../../../utils/vue';
import {
	libraryAddGameToPlaylist,
	libraryNewPlaylist,
	libraryRemoveGameFromPlaylist,
	useLibraryStore,
} from '../../../store/library';

@Options({
	components: {
		AppLoading,
	},
	directives: {
		AppFocusWhen: vAppFocusWhen,
	},
})
export default class AppGamePlaylistAddToPopover extends Vue {
	@Prop(Object)
	game!: GameModel;

	libraryStore = shallowSetup(() => useLibraryStore());

	playlists: GamePlaylistModel[] = [];
	playlistsWithGame: number[] = [];

	isLoading = true;
	filterQuery = '';

	get filteredPlaylists() {
		return this.playlists
			.filter(item => fuzzysearch(this.filterQuery.toLowerCase(), item.name.toLowerCase()))
			.sort((a, b) => stringSort(a.name, b.name));
	}

	mounted() {
		this.fetchPlaylists();
		Analytics.trackEvent('add-to-playlist', 'open');
	}

	close() {
		Popper.hideAll();
	}

	async fetchPlaylists() {
		const response = await GamePlaylistModel.fetchPlaylists({
			gameId: this.game.id,
		});

		this.playlists = response.playlists;
		this.playlistsWithGame = response.playlistsWithGame;
		this.isLoading = false;
	}

	selectPlaylist(playlist: GamePlaylistModel) {
		if (this.playlistsWithGame.indexOf(playlist.id) === -1) {
			this.addToPlaylist(playlist);
			Analytics.trackEvent('add-to-playlist', 'add-game');
		} else {
			this.removeFromPlaylist(playlist);
			Analytics.trackEvent('add-to-playlist', 'remove-game');
		}
	}

	async addToPlaylist(playlist: GamePlaylistModel) {
		const game = this.game;
		if (await libraryAddGameToPlaylist(this.libraryStore, playlist, game)) {
			this.playlistsWithGame.push(playlist.id);
		}
	}

	async removeFromPlaylist(playlist: GamePlaylistModel) {
		const game = this.game;
		if (await libraryRemoveGameFromPlaylist(this.libraryStore, playlist, game)) {
			const index = this.playlistsWithGame.indexOf(playlist.id);
			if (index !== -1) {
				this.playlistsWithGame.splice(index, 1);
			}
		}
	}

	async addToNewPlaylist() {
		const collection = await libraryNewPlaylist(this.libraryStore);
		if (collection && collection.playlist) {
			// Now that the playlist is created, let's add the game to this playlist.
			this.addToPlaylist(collection.playlist);
		}
	}
}
</script>

<template>
	<div class="add-to-playlist-popover">
		<AppLoading v-if="isLoading" :centered="true" />
		<template v-else>
			<div class="list-group list-group-dark">
				<a class="list-group-item has-icon" @click="addToNewPlaylist">
					<AppJolticon icon="add" />
					<AppTranslate>New Playlist</AppTranslate>
				</a>
				<div v-if="playlists.length" class="list-group-item">
					<input
						v-model="filterQuery"
						v-app-focus-when
						type="search"
						class="form-control"
						:placeholder="$gettext('Filter playlists...')"
						@keydown.esc.stop="close"
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
					<AppJolticon icon="playlist" />
					<AppJolticon icon="check" />
					<AppJolticon icon="remove" />
					<AppJolticon icon="add" />
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
