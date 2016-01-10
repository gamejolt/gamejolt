angular.module( 'App.Views' ).controller( 'Profile.LibraryCtrl', function( $scope, App, GameCollection, payload )
{
	App.title = 'Library of ' + $scope.profileCtrl.user.display_name;

	this.collections = GameCollection.populate( payload.collections );

	this.followedCollection = payload.followedCollection ? new GameCollection( payload.followedCollection ) : null;
	this.developerCollection = payload.developerCollection ? new GameCollection( payload.developerCollection ) : null;

	this.collections.unshift( this.followedCollection );

	if ( this.developerCollection ) {
		this.collections.unshift( this.developerCollection );
	}
} );
