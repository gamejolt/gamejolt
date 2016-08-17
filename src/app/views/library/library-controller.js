angular.module( 'App.Views' ).controller( 'LibraryCtrl', function( $scope, $state, App, GameCollection, GamePlaylist_SaveModal, libraryPayload )
{
	var _this = this;

	$scope.App = App;

	// Don't do anything if not logged in.
	if ( !App.user ) {
		return;
	}

	this.playlistFilterQuery = '';
	this.shouldShowSidebar = true;

	this.collections = GameCollection.populate( libraryPayload.collections );
	this.followedCollection = libraryPayload.followedCollection ? new GameCollection( libraryPayload.followedCollection ) : null;
	this.developerCollection = libraryPayload.developerCollection ? new GameCollection( libraryPayload.developerCollection ) : null;
	this.ownedCollection = libraryPayload.ownedCollection ? new GameCollection( libraryPayload.ownedCollection ) : null;
	this.bundleCollections = GameCollection.populate( libraryPayload.bundleCollections );

	this.showAddPlaylistModal = showAddPlaylistModal;
	this.playlistFilterComparator = playlistFilterComparator;

	function showAddPlaylistModal()
	{
		GamePlaylist_SaveModal.show().then( function( response )
		{
			var collection = new GameCollection( response.gameCollection );
			_this.collections.push( collection );

			$state.go( collection.getSref(), collection.getSrefParams() );
		} );
	}

	/**
	 * We compare the collection's name or owner's name if it's a subscription.
	 * This way they can search for "cros" and get cros's games if they're following.
	 */
	function playlistFilterComparator( item )
	{
		var actual;
		var expected = _this.playlistFilterQuery.toLowerCase();

		actual = item.name.toLowerCase();
		if ( actual.indexOf( expected ) !== -1 ) {
			return true;
		}

		if ( item.from_subscription ) {
			actual = item.owner.display_name.toLowerCase();
			if ( actual.indexOf( expected ) !== -1 ) {
				return true;
			}
		}

		return false;
	}
} );
