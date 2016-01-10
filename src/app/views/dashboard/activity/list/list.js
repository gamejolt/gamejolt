angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.activity.list', {
		url: '^/activity/:tab?filter&page',
		templateUrl: '/app/views/dashboard/activity/list/list.html',
		controller: 'Dashboard.Activity.ListCtrl',
		controllerAs: 'listCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				var query = [];

				if ( $stateParams.tab == 'unread' ) {
					query.push( 'state=unread' );
				}

				if ( $stateParams.filter ) {
					query.push( 'type=' + $stateParams.filter );
				}

				if ( $stateParams.page && $stateParams.page > 1 ) {
					query.push( 'page=' + $stateParams.page );
				}

				return Api.sendRequest( '/web/dash/activity?' + query.join( '&' ) );
			}
		}
	} );
} );
