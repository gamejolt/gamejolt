angular.module( 'App.GamePlaylist.AddToPopover' ).directive( 'gjGamePlaylistAddToPopover', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/game-playlist/add-to-popover/add-to-popover.html',
		scope: {
			game: '=gjGame',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, Translate, GamePlaylist, Growls, GamePlaylist_SaveModal, Popover, Screen, Analytics )
		{
			var _this = this;

			$scope.Screen = Screen;

			this.playlists = [];
			this.playlistsWithGame = [];

			this.isShown = false;
			this.isLoading = true;
			this.filterQuery = '';

			this.onFocus = function()
			{
				this.isShown = true;
				this.fetchPlaylists();

				Analytics.trackEvent( 'add-to-playlist', 'open' );
			};

			this.onBlur = function()
			{
				this.isShown = false;
			};

			this.close = function( $event )
			{
				// Don't propagate the escape press.
				if ( $event ) {
					$event.stopPropagation();
				}

				Popover.hideAll();
			};

			this.fetchPlaylists = function()
			{
				GamePlaylist.fetchPlaylists( { gameId: this.game.id } ).then( function( response )
				{
					_this.playlists = response.playlists;
					_this.playlistsWithGame = response.playlistsWithGame;
					_this.isLoading = false;
				} );
			};

			this.selectPlaylist = function( playlist )
			{
				if ( this.playlistsWithGame.indexOf( playlist.id ) === -1 ) {
					this.addToPlaylist( playlist );
					Analytics.trackEvent( 'add-to-playlist', 'add-game' );
				}
				else {
					this.removeFromPlaylist( playlist );
					Analytics.trackEvent( 'add-to-playlist', 'remove-game' );
				}
			};

			this.addToPlaylist = function( playlist )
			{
				playlist.$addGame( this.game.id ).then( function( playlistGame )
				{
					Translate.growl( 'success', 'library.playlists.add_game_success', { game: _this.game.title, playlist: playlist.name } );
					_this.playlistsWithGame.push( playlist.id );
					Popover.hideAll();
				} )
				.catch( function()
				{
					Translate.growl( 'error', 'library.playlists.add_game_error', { game: _this.game.title, playlist: playlist.name } );
				} );
			};

			this.removeFromPlaylist = function( playlist )
			{
				playlist.$removeGame( this.game.id ).then( function( playlistGame )
				{
					Translate.growl( 'success', 'library.playlists.remove_game_success', { game: _this.game.title, playlist: playlist.name } );
					_.pull( this.playlistsWithGame, playlist.id );
					Popover.hideAll();
				} )
				.catch( function()
				{
					Translate.growl( 'error', 'library.playlists.remove_game_error', { game: _this.game.title, playlist: playlist.name } );
				} );
			};

			this.newPlaylist = function()
			{
				Analytics.trackEvent( 'add-to-playlist', 'new-playlist' );

				GamePlaylist_SaveModal.show().then( function( response )
				{
					var newPlaylist = new GamePlaylist( response.gamePlaylist );
					_this.playlists.push( newPlaylist );

					// Now that the playlist is created, let's add the game to this playlist.
					_this.addToPlaylist( newPlaylist );

					Analytics.trackEvent( 'add-to-playlist', 'new-playlist-complete' );
				} );
			};
		}
	};
} );
