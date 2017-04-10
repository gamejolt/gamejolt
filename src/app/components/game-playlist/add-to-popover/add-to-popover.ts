import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add-to-popover.html?style=./add-to-popover.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { fuzzysearch } from '../../../../lib/gj-lib-client/utils/string';
import { AppFocusWhen } from '../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { LibraryState } from '../../../store/library';

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
		AppLoading,
	},
	directives: {
		AppFocusWhen,
	},
})
export class AppGamePlaylistAddToPopover extends Vue
{
	@Prop( Game ) game: Game;

	@State library: LibraryState;

	playlists: GamePlaylist[] = [];
	playlistsWithGame: number[] = [];

	isShown = false;
	isLoading = true;
	filterQuery = '';

	Screen = makeObservableService( Screen );

	get filteredPlaylists()
	{
		return this.playlists
			.filter( ( item ) => fuzzysearch( this.filterQuery.toLowerCase(), item.name.toLowerCase() ) )
			.sort( ( a, b ) => stringSort( a.name, b.name ) );
	}

	onFocus()
	{
		this.isShown = true;
		this.fetchPlaylists();

		Analytics.trackEvent( 'add-to-playlist', 'open' );
	}

	onBlur()
	{
		this.isShown = false;
	}

	close()
	{
		Popover.hideAll();
	}

	async fetchPlaylists()
	{
		const response = await GamePlaylist.fetchPlaylists( { gameId: this.game.id } );

		this.playlists = response.playlists;
		this.playlistsWithGame = response.playlistsWithGame;
		this.isLoading = false;
	}

	selectPlaylist( playlist: GamePlaylist )
	{
		if ( this.playlistsWithGame.indexOf( playlist.id ) === -1 ) {
			this.addToPlaylist( playlist );
			Analytics.trackEvent( 'add-to-playlist', 'add-game' );
		}
		else {
			this.removeFromPlaylist( playlist );
			Analytics.trackEvent( 'add-to-playlist', 'remove-game' );
		}
	}

	async addToPlaylist( playlist: GamePlaylist )
	{
		if ( await this.library.addGameToPlaylist( playlist, this.game ) ) {
			this.playlistsWithGame.push( playlist.id );
			Popover.hideAll();
		}
	}

	async removeFromPlaylist( playlist: GamePlaylist )
	{
		if ( await this.library.removeGameFromPlaylist( playlist, this.game ) ) {
			const index = this.playlistsWithGame.indexOf( playlist.id );
			if ( index !== -1 ) {
				this.playlistsWithGame.splice( index, 1 );
			}

			Popover.hideAll();
		}
	}

	async addToNewPlaylist()
	{
		const collection = await this.library.newPlaylist();
		if ( collection && collection.playlist ) {

			// Now that the playlist is created, let's add the game to this playlist.
			this.addToPlaylist( collection.playlist );
		}
	}
}
