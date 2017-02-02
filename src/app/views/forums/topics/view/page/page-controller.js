angular.module( 'App.Views.Forums' ).controller( 'Forums.Topics.View.PageCtrl', function( $scope, App, Forum_Channel, Forum_Topic, Forum_Post, Location, payload )
{
	var viewCtrl = $scope.viewCtrl;

	Location.enforce( {
		slug: payload.topic.slug,
	} );

	viewCtrl.topic = new Forum_Topic( payload.topic );
	viewCtrl.channel = new Forum_Channel( payload.channel );
	viewCtrl.posts = Forum_Post.populate( payload.posts );

	App.title = viewCtrl.topic.title;

	viewCtrl.perPage = payload.perPage;
	viewCtrl.currentPage = payload.page || 1;
	viewCtrl.isFollowing = payload.isFollowing || false;
	viewCtrl.followerCount = payload.followerCount || 0;
	viewCtrl.userPostCounts = payload.userPostCounts || {};
} );
