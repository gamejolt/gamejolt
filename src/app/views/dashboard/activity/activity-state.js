angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.activity', {
		abstract: true,
		// url: '^/activity',
		templateUrl: '/app/views/dashboard/activity/activity.html',
		controller: 'Dashboard.ActivityCtrl',
		controllerAs: 'activityCtrl',
	} );
} );
