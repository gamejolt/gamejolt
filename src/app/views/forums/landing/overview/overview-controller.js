angular.module( 'App.Views' ).controller( 'Forums.Landing.OverviewCtrl', function( $scope, App, Forum_Category, Forum_Channel, Forum_Post, payload )
{
	App.title = 'Forums';

	this.categories = Forum_Category.populate( payload.categories );
	this.channels = _.groupBy( Forum_Channel.populate( payload.channels ), 'category_id' );
	this.latestPosts = Forum_Post.populate( payload.latestPosts );
	this.postCountPerPage = payload.postCountPerPage;
} );
