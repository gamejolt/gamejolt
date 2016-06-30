angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Game.MusicCtrl', function(
	$scope, App, Game_Song, ModalConfirm, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'dash.games.music.page_title', { game: $scope.manageCtrl.game.title } );

	this.songs = Game_Song.populate( payload.songs );
	this.isAdding = false;
	this.activeItem = null;
	this.currentSort = null;

	this.onSongEdited = onSongEdited;
	this.onSongAdded = onSongAdded;
	this.removeSong = removeSong;
	this.onSongsSorted = onSongsSorted;

	function onSongEdited()
	{
		this.activeItem = null;
	}

	function onSongAdded( formModel )
	{
		this.songs.push( new Game_Song( formModel ) );
		this.isAdding = false;
		updateSort();
	}

	function onSongsSorted()
	{
		var newSort = _.pluck( _this.songs, 'id' );

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, _this.currentSort ) ) {

			// Save off the sort.
			_this.currentSort = newSort;
			Game_Song.$saveSort( $scope.manageCtrl.game.id, newSort );
		}
	}

	function removeSong( song )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.music.remove_confirmation' ) ).then( function()
		{
			return song.$remove();
		} )
		.then( function()
		{
			_.remove( _this.songs, { id: song.id } );
			updateSort();
		} );
	}

	function updateSort()
	{
		_this.currentSort = _.pluck( _this.songs, 'id' );
	}
} );
