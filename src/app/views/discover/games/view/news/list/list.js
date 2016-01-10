angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	// /games/blind-redux/news/1050/
	$urlRouterProvider.when( '/games/{slug:string}/news/{id:int}', '/games/:slug/:id/news' );

	$stateProvider.state( 'discover.games.view.news.list', {
		url: '/news?page',
		controller: 'Discover.Games.View.News.ListCtrl',
		controllerAs: 'listCtrl',
		templateUrl: '/app/views/discover/games/view/news/list/list.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				var query = '';
				if ( $stateParams.page > 1 ) {
					query = '?page=' + $stateParams.page;
				}

				return Api.sendRequest( '/web/discover/games/news/' + $stateParams.id + query );
			}
		}
	} );
} );
