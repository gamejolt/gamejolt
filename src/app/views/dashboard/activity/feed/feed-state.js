angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.activity.feed', {
		url: '^/{tab:activity|notifications}',
		templateUrl: '/app/views/dashboard/activity/feed/feed.html',
		controller: 'Dashboard.Activity.FeedCtrl',
		controllerAs: 'feedCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/dash/activity/' + $stateParams['tab'] );
			}
		}
	} );
} );
