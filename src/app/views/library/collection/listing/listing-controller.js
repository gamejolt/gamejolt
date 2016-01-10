angular.module( 'App.Views' ).controller( 'Library.Collection.ListingCtrl', function(
	$scope, $state, $stateParams, $translate, App, Translate, Game, GameLibrary_Game, ModalConfirm, payload )
{
	var _this = this;

	var collectionCtrl = $scope.collectionCtrl;
	collectionCtrl.type = $state.current.data.collectionType;

	this.processPayload = function( payload )
	{
		this.games = Game.populate( payload.games );
		collectionCtrl.processPayload( payload, $stateParams );

		// Controls on thumbnails.
		this.thumbnailControl = '';
		if ( App.user && collectionCtrl.collection.owner && collectionCtrl.collection.owner.id == App.user.id ) {
			if ( collectionCtrl.type == 'playlist' ) {
				this.thumbnailControl = 'remove';
				this.thumbnailControlLabel = $translate.instant( 'library.collection.thumbnail_control_playlist_tooltip' );
				this.thumbnailControlAction = this.removeFromPlaylist;
			}
			else if ( collectionCtrl.type == 'followed' ) {
				this.thumbnailControl = 'subscribed';
				this.thumbnailControlLabel = $translate.instant( 'library.collection.thumbnail_control_unfollow_tooltip' );
				this.thumbnailControlAction = this.removeFromLibrary;
			}
		}
	};

	this.removeFromPlaylist = function( game )
	{
		var playlist = collectionCtrl.playlist;

		ModalConfirm.show( $translate.instant( 'library.playlists.remove_game_confirmation', { game: game.title, playlist: playlist.name } ) )
			.then( function()
			{
				playlist.$removeGame( game.id ).then( function()
				{
					Translate.growl( 'success', 'library.playlists.remove_game_success', { game: game.title, playlist: playlist.name } );
					_this._removeGame( game );
				} )
				.catch( function()
				{
					Translate.growl( 'error', 'library.playlists.remove_game_error', { game: game.title, playlist: playlist.name } );
				} );
			} );
	};

	this.removeFromLibrary = function( game )
	{
		var libraryGame = new GameLibrary_Game();
		libraryGame.game_id = game.id;

		ModalConfirm.show( $translate.instant( 'library.followed.remove_game_confirmation', { game: game.title } ) )
			.then( function()
			{
				libraryGame.$remove().then( function()
				{
					Translate.growl( 'success', 'library.followed.remove_game_success', { game: game.title } );
					_this._removeGame( game );
				} )
				.catch( function()
				{
					Translate.growl( 'error', 'library.followed.remove_game_error', { game: game.title } );
				} );
			} );
	};

	this._removeGame = function( game )
	{
		_.remove( this.games, { id: game.id } );
		--collectionCtrl.gamesCount;
		--collectionCtrl.totalGamesCount;
	};

	this.processPayload( payload );
} );
