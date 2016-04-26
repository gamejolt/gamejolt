angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.reports', {
		abstract: true,
		url: '/reports',
		controller: 'Dashboard.ReportsCtrl',
		controllerAs: 'reportsCtrl',
		templateUrl: '/app/views/dashboard/reports/reports.html',
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
		params: {
			period: {
				value: '',
				squash: true,
			},
			resource: {
				value: '',
				squash: true,
			},
			resourceId: {
				value: '',
				squash: true,
			},
			eventType: {
				value: '',
				squash: true,
			},
		},
	} );
} );
