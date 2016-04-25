angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.reports', {
		url: '/reports',
		controller: 'Dashboard.ReportsCtrl',
		controllerAs: 'reportsCtrl',
		templateUrl: '/app/views/dashboard/reports/reports.html',
		redirectTo: function()
		{
			this.go( 'dashboard.reports.view', {
				period: 'all',
				resource: 'Game',
				resourceId: 1050,
				eventType: 'view',
			} );
		},
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/reports' );
			}
		},
	} );

	$stateProvider.state( 'dashboard.reports.view', {
		url: '/:period/:resource/:resourceId/:eventType?year&month',
		controller: function( $scope, $stateParams )
		{
			$scope.reportsCtrl.stateChanged( $stateParams );
		},
	} );
} );
