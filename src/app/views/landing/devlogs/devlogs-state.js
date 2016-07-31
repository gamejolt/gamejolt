angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.devlogs', {
		url: '/devlogs/about',
		controller: 'Landing.DevlogsCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/devlogs/devlogs.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/touch' );
			},
		}
	} );
} );
