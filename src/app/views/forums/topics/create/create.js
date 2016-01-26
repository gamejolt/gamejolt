angular.module( 'App.Views' ).config( function( $stateProvider )
{   
	$stateProvider.state( 'forums.topics.create', {
		url: '/f/:channelName/create',
		controller: 'Forums.Topics.CreateCtrl',
		controllerAs: 'createCtrl',
		templateUrl: '/app/views/forums/topics/create/create.html',
	} );
} );