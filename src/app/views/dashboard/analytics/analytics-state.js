angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.analytics', {
		abstract: true,
		url: '/analytics',
		controller: 'Dashboard.AnalyticsCtrl',
		controllerAs: 'analyticsCtrl',
		templateUrl: '/app/views/dashboard/analytics/analytics.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/dash/analytics' );
			}
		},
	} );

	$stateProvider.state( 'dashboard.analytics.view', {
		url: '/:period/:resource/:resourceId/:metricKey?year&month',
		controller: function( $scope, $stateParams )
		{
			$scope.analyticsCtrl.stateChanged( $stateParams );
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
			metricKey: {
				value: '',
				squash: true,
			},
		},
	} );
} );
