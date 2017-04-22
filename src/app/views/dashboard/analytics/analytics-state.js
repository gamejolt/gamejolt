angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.analytics', {
		abstract: true,
		url: '/analytics/:resource/:resourceId',
		controller: 'Dashboard.AnalyticsCtrl',
		controllerAs: 'analyticsCtrl',
		templateUrl: require( './analytics.html' ),
		resolve: {
            payload: function( Api, $stateParams )
            {
                return Api.sendRequest( '/web/dash/analytics/' + $stateParams.resource + '/' + $stateParams.resourceId );
            }
        },
	} );

	$stateProvider.state( 'dashboard.analytics.view', {
		url: '/:period/:metricKey?viewAs&year&month',
		controller: function( $scope, $stateParams )
		{
			$scope.analyticsCtrl.stateChanged( $stateParams );
		},
		params: {
			period: 'monthly',
			metricKey: {
				value: '',
				squash: true,
			},
		},
	} );
} );
