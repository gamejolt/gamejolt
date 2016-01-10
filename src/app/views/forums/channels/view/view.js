angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.channels.view', {
		url: '/f/:channelName',
		controller: 'Forums.Channels.ViewCtrl',
		controllerAs: 'viewCtrl',
		templateUrl: '/app/views/forums/channels/view/view.html',
	} );
} );