angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.view', {
		url: '/f/:topicSlug/:topicId',
		controller: 'Forums.TopicCtrl',
		controllerAs: 'topicCtrl',
		templateUrl: '/app/views/forums/topics/view/view.html',
	} );
} );