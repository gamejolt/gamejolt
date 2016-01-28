angular.module( 'App.Views' ).controller( 'Forums.Topics.ViewCtrl', function( $scope, App, Forum_Channel, Forum_Topic, Forum_Post, payload )
{
	this.topic = new Forum_Topic( payload.topic );
	this.channel = new Forum_Channel( payload.channel );
	this.posts = Forum_Post.populate( payload.posts );

	App.title = this.topic.title;
} );
