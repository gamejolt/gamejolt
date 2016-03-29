angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.main.overview', {
		url: '',
		controller: 'Dashboard.Main.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/dashboard/main/overview/overview.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash' );
			}
		}
	} );
} );
