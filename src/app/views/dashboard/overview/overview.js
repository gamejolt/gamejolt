angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.overview', {
		url: '',
		controller: 'Dashboard.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/dashboard/overview/overview.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash' );
			}
		}
	} );
} );
