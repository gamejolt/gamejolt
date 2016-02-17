angular.module( 'App.Views' ).controller( 'Forums.Channels.View.PageCtrl', function( $scope, App, Forum_Channel, Forum_Topic, Location, payload )
{
	var viewCtrl = $scope.viewCtrl;

	Location.enforce( {
		name: payload.channel.name,
	} );

	viewCtrl.channel = new Forum_Channel( payload.channel );
	viewCtrl.topics = Forum_Topic.populate( payload.topics );
	viewCtrl.postCountPerPage = payload.postCountPerPage;

	if ( payload.stickyTopics && payload.stickyTopics.length ) {
		viewCtrl.stickyTopics = Forum_Topic.populate( payload.stickyTopics );
	}
	else {
		viewCtrl.stickyTopics = [];
	}

	App.title = '#' + viewCtrl.channel.name + ' forum';

	viewCtrl.perPage = payload.perPage;
	viewCtrl.currentPage = payload.page || 1;
} );
