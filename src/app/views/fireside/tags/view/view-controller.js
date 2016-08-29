angular.module( 'App.Views' ).controller( 'Tags.ViewCtrl', function( $scope, $stateParams, Fireside_Post, payload )
{
	this.tag = $stateParams.tag;

	$scope.App.title = 'Articles tagged #' + this.tag;

	if ( payload.posts ) {
		this.posts = Fireside_Post.populate( payload.posts );
	}
	else {
		this.posts = [];
	}
} );
