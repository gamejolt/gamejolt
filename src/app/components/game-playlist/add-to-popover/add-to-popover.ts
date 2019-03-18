import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import { AppFocusWhen } from 'game-jolt-frontend-lib/components/form-vue/focus-when.directive';
import { GamePlaylist } from 'game-jolt-frontend-lib/components/game-playlist/game-playlist.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import { stringSort } from 'game-jolt-frontend-lib/utils/array';
import { fuzzysearch } from 'game-jolt-frontend-lib/utils/string';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { LibraryStore } from '../../../store/library';

@Component({
	components: {
		AppLoading,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class AppGamePlaylistAddToPopover extends Vue {
	@Prop(Game)
	game!: Game;

	@Action('library/addGameToPlaylist')
	addGameToPlaylist!: LibraryStore['addGameToPlaylist'];

	@Action('library/removeGameFromPlaylist')
	removeGameFromPlaylist!: LibraryStore['removeGameFromPlaylist'];

	@Action('library/newPlaylist')
	newPlaylist!: LibraryStore['newPlaylist'];

	playlists: GamePlaylist[] = [];
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
		const response = await GamePlaylist.fetchPlaylists({
			gameId: this.game.id,
		});

		this.playlists = response.playlists;
		this.playlistsWithGame = response.playlistsWithGame;
		this.isLoading = false;
	}

	selectPlaylist(playlist: GamePlaylist) {
		if (this.playlistsWithGame.indexOf(playlist.id) === -1) {
			this.addToPlaylist(playlist);
			Analytics.trackEvent('add-to-playlist', 'add-game');
		} else {
			this.removeFromPlaylist(playlist);
			Analytics.trackEvent('add-to-playlist', 'remove-game');
		}
	}

	async addToPlaylist(playlist: GamePlaylist) {
		const game = this.game;
		if (await this.addGameToPlaylist({ playlist, game })) {
			this.playlistsWithGame.push(playlist.id);
		}
	}

	async removeFromPlaylist(playlist: GamePlaylist) {
		const game = this.game;
		if (await this.removeGameFromPlaylist({ playlist, game })) {
			const index = this.playlistsWithGame.indexOf(playlist.id);
			if (index !== -1) {
				this.playlistsWithGame.splice(index, 1);
			}
		}
	}

	async addToNewPlaylist() {
		const collection = await this.newPlaylist();
		if (collection && collection.playlist) {
			// Now that the playlist is created, let's add the game to this playlist.
			this.addToPlaylist(collection.playlist);
		}
	}
}
