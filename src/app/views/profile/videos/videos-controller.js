angular.module( 'App.Views' ).controller( 'Profile.VideosCtrl', function( $scope, App, Comment_Video, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'Videos from {{ user }}', { user: $scope.profileCtrl.user.display_name } );

	this.videos = Comment_Video.populate( payload.videos );
} );
