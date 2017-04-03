import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add-to-popover.html?style=./add-to-popover.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { GamePlaylist } from '../../../../lib/gj-lib-client/components/game-playlist/game-playlist.model';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { fuzzysearch } from '../../../../lib/gj-lib-client/utils/string';
import { AppFocusWhen } from '../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';

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
		try {
			await playlist.$addGame( this.game.id );

			// TODO
			Growls.success(
				this.$gettextInterpolate( 'library.playlists.add_game_success_growl', { game: this.game.title, playlist: playlist.name } ),
				this.$gettextInterpolate( 'library.playlists.add_game_success_growl_title', { game: this.game.title, playlist: playlist.name } )
			);

			this.playlistsWithGame.push( playlist.id );
			Popover.hideAll();
		}
		catch( e ) {
			Growls.error(
				this.$gettextInterpolate( 'library.playlists.add_game_error_growl', { game: this.game.title, playlist: playlist.name } ),
				this.$gettextInterpolate( 'library.playlists.add_game_error_growl_title', { game: this.game.title, playlist: playlist.name } )
			);
		}
	}

	async removeFromPlaylist( playlist: GamePlaylist )
	{
		try {
			await playlist.$removeGame( this.game.id );

			// TODO
			Growls.success(
				this.$gettextInterpolate( 'library.playlists.remove_game_success_growl', { game: this.game.title, playlist: playlist.name } ),
				this.$gettextInterpolate( 'library.playlists.remove_game_success_growl_title', { game: this.game.title, playlist: playlist.name } )
			);

			const index = this.playlistsWithGame.indexOf( playlist.id );
			if ( index !== -1 ) {
				this.playlistsWithGame.splice( index, 1 );
			}

			Popover.hideAll();
		}
		catch( e ) {
			Growls.error(
				this.$gettextInterpolate( 'library.playlists.remove_game_error_growl', { game: this.game.title, playlist: playlist.name } ),
				this.$gettextInterpolate( 'library.playlists.remove_game_error_growl_title', { game: this.game.title, playlist: playlist.name } )
			);
		}
	}

	async newPlaylist()
	{
		Analytics.trackEvent( 'add-to-playlist', 'new-playlist' );

		// await GamePlaylist_SaveModal.show().then( function( response )
		// {
		// 	var newPlaylist = new GamePlaylist( response.gamePlaylist );
		// 	_this.playlists.push( newPlaylist );

		// 	// Now that the playlist is created, let's add the game to this playlist.
		// 	_this.addToPlaylist( newPlaylist );

		// 	Analytics.trackEvent( 'add-to-playlist', 'new-playlist-complete' );
		// } );
	}
}
