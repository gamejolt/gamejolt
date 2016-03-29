angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.reports', {
		url: '/reports',
		controller: 'Dashboard.ReportsCtrl',
		controllerAs: 'reportsCtrl',
		templateUrl: '/app/views/dashboard/reports/reports.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/reports' );
			}
		}
	} );
} );
