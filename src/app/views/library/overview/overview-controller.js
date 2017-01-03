angular.module( 'App.Views' ).controller( 'Library.OverviewCtrl', function( $scope, $timeout, App, GameCollection, Shell, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'library.page_title' );

	this.collectionTypes = [
		{
			key: 'mainCollections',
			heading: null,
			eventLabel: 'system',
		},
		{
			key: 'playlistCollections',
			heading: 'Your Playlists',
			eventLabel: 'playlist',
		},
		{
			key: 'bundleCollections',
			heading: 'Bundles',
			eventLabel: 'bundle',
		},
		{
			key: 'followedCollections',
			heading: 'Followed Playlists',
			eventLabel: 'followed',
		}
	];

	this.followedCollection = payload.followedCollection ? new GameCollection( payload.followedCollection ) : null;
	this.developerCollection = payload.developerCollection ? new GameCollection( payload.developerCollection ) : null;
	this.ownedCollection = payload.ownedCollection ? new GameCollection( payload.ownedCollection ) : null;
	this.recommendedCollection = payload.recommendedCollection ? new GameCollection( payload.recommendedCollection ) : null;

	this.bundleCollections = GameCollection.populate( payload.bundleCollections );

	// Main collections that belong to the user get chunked out.
	this.mainCollections = [];
	if ( this.followedCollection ) {
		this.mainCollections.push( this.followedCollection );
	}

	if ( this.developerCollection ) {
		this.mainCollections.push( this.developerCollection );
	}

	if ( this.ownedCollection ) {
		this.mainCollections.push( this.ownedCollection );
	}

	if ( this.recommendedCollection ) {
		this.mainCollections.push( this.recommendedCollection );
	}

	this.playlistCollections = [];
	this.followedCollections = [];
	$scope.$watchCollection( function()
	{
		return Shell.collections;
	},
	function( collections )
	{
		collections.forEach( function( collection )
		{
			if ( collection.type == 'playlist' && !collection.from_subscription ) {
				_this.playlistCollections.push( collection );
			}
			else {
				_this.followedCollections.push( collection );
			}
		} );
	} );
} );
