angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.view', {
		url: '/f/:topicSlug/:topicId',
		controller: 'Forums.Topics.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/forums/topics/view/view.html',
	} );
} );