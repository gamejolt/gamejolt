import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeDashAnalytics: VueRouter.RouteConfig = {
	name: 'dash.analytics',
	path: 'analytics/:resource/:resourceId/:metricKey?',
	// props: true,
	component: () => asyncComponentLoader( $import( './analytics' ) ),
};


// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'dash.analytics', {
// 		abstract: true,
// 		url: '/analytics/:resource/:resourceId',
// 		controller: 'Dashboard.AnalyticsCtrl',
// 		controllerAs: 'analyticsCtrl',
// 		templateUrl: require( './analytics.html' ),
// 		resolve: {
// 			payload: function( Api, $stateParams )
// 			{
// 				return Api.sendRequest( '/web/dash/analytics/' + $stateParams.resource + '/' + $stateParams.resourceId );
// 			}
// 		},
// 	} );

// 	$stateProvider.state( 'dash.analytics.view', {
// 		url: '/:period/:metricKey?year&month',
// 		controller: function( $scope, $stateParams )
// 		{
// 			$scope.analyticsCtrl.stateChanged( $stateParams );
// 		},
// 		params: {
// 			period: 'monthly',
// 			metricKey: {
// 				value: '',
// 				squash: true,
// 			},
// 		},
// 	} );
// } );
