angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.activity.feed', {
		url: '',
		templateUrl: '/app/views/dashboard/activity/feed/feed.html',
		controller: 'Dashboard.Activity.FeedCtrl',
		controllerAs: 'feedCtrl',
		resolve: {
			payload: function( $stateParams, Api )
			{
				var query = [];

				// if ( $stateParams.tab == 'unread' ) {
				// 	query.push( 'state=unread' );
				// }

				// if ( $stateParams.filter ) {
				// 	query.push( 'type=' + $stateParams.filter );
				// }

				// if ( $stateParams.page && $stateParams.page > 1 ) {
				// 	query.push( 'page=' + $stateParams.page );
				// }

				return Api.sendRequest( '/web/dash/activity?' + query.join( '&' ) );
			}
		}
	} );
} );
