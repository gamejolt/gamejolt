angular.module( 'App.Views' ).controller( 'Forums.LandingCtrl', function( $scope, App, Forum_Category, Forum_Channel, payload )
{
	App.title = 'Forums';

	this.categories = Forum_Category.populate( payload.categories );
	this.channels = _.groupBy( Forum_Channel.populate( payload.channels ), 'category_id' );
} );
