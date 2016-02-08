angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.view', {
		abstract: true,
		controller: 'Forums.Topics.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/forums/topics/view/view.html',
	} );
} );
