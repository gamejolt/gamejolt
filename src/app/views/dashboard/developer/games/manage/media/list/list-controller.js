angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.ListCtrl', function(
	$scope, Api, App, Game_Screenshot, Game_Video, ModalConfirm, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'dash.games.media.page_title', { game: $scope.manageCtrl.game.title } );

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
	this.getEditTooltip = getEditTooltip;

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
		var typeLabel;
		if ( item.media_type == 'image' ) {
			typeLabel = gettextCatalog.getString( 'dash.games.media.image_label' ).toLowerCase();
		}
		else if ( item.media_type == 'video' ) {
			typeLabel = gettextCatalog.getString( 'dash.games.media.video_label' ).toLowerCase();
		}

		/// {{ type }} contains the translated media item type (image/video)
		var message = gettextCatalog.getString( 'dash.games.media.remove_confirmation', { type: typeLabel } );

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

	function getEditTooltip( item )
	{
		if ( item.media_type == 'image' ) {
			return gettextCatalog.getString( 'dash.games.media.edit_image_button' );
		}
		else if ( item.media_type == 'video' ) {
			return gettextCatalog.getString( 'dash.games.media.edit_video_button' );
		}
	}

	function getRemoveTooltip( item )
	{
		if ( item.media_type == 'image' ) {
			return gettextCatalog.getString( 'dash.games.media.remove_image_button' );
		}
		else if ( item.media_type == 'video' ) {
			return gettextCatalog.getString( 'dash.games.media.remove_video_button' );
		}
	}
} );
