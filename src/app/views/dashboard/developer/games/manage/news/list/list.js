angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	// $urlRouterProvider.when( '/dashboard/developer/games/screenshots/:id', '/dashboard/developer/games/:id/media' );
	// $urlRouterProvider.when( '/dashboard/developer/games/videos/:id', '/dashboard/developer/games/:id/media' );

	$stateProvider.state( 'dashboard.developer.games.manage.news.list', {
		url: '?page',
		controller: 'Dashboard.Developer.Games.Manage.News.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/news/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				var query = [];
				if ( $stateParams.page ) {
					query.push( 'page=' + $stateParams.page );
				}

				return Api.sendRequest( '/web/dash/developer/games/news/' + $stateParams.id + '?' + query.join( '&' ) );
			}
		}
	} );
} );
