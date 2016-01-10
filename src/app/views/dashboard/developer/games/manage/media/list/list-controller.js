angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.ListCtrl', function(
	$scope, $translate, Api, Translate, Game_Screenshot, Game_Video, ModalConfirm, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.games.media.page_title', { game: $scope.manageCtrl.game.title } );

	this.currentSort = null;
	this.mediaItems = [];

	if ( payload.mediaItems && payload.mediaItems.length ) {
		payload.mediaItems.forEach( function( item )
		{
			if ( item.media_type == 'image' ) {
				this.mediaItems.push( new Game_Screenshot( item ) );
			}
			else if ( item.media_type == 'video' ) {
				this.mediaItems.push( new Game_Video( item ) );
			}
		}, this );
	}

	this.removeItem = removeItem;
	this.onMediaSorted = onMediaSorted;

	function onMediaSorted()
	{
		var newSort = getSort();

		// Make sure that the sorting has changed.
		if ( !angular.equals( newSort, _this.currentSort ) ) {

			// Save off the sort.
			_this.currentSort = newSort;
			Api.sendRequest( '/web/dash/developer/games/media/save-sort/' + $scope.manageCtrl.game.id, newSort );
		}
	}

	function removeItem( item )
	{
		var message = $translate.instant( 'dash.games.media.remove_confirmation', {
			type: $translate.instant( 'dash.games.media.' + item.media_type + '_label' ).toLowerCase(),
		} );

		ModalConfirm.show( message ).then( function()
		{
			return item.$remove();
		} )
		.then( function()
		{
			_.remove( _this.mediaItems, { id: item.id } );
			updateSort();
		} );
	};

	function getSort()
	{
		return _this.mediaItems.map( function( item )
		{
			if ( item.media_type == 'image' ) {
				return 'screenshot-' + item.id;
			}
			else if ( item.media_type == 'video' ) {
				return 'video-' + item.id;
			}
		} );
	}

	function updateSort()
	{
		_this.currentSort = getSort();
	}
} );
