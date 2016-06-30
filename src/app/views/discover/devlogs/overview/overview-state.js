angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.devlogs.overview', {
		url: '',
		controller: 'Discover.Devlogs.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/devlogs/overview/overview.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/devlogs' );
			},
		}
	} );
} );
