angular.module( 'App.Views' ).config( function( $stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider )
{
	function buildQuery( $stateParams, filteringContainer )
	{
		var query = '?section=' + $stateParams.section;

		if ( $stateParams.category ) {
			query += '&category=' + $stateParams.category;
		}

		if ( $stateParams.date ) {
			query += '&date=' + $stateParams.date;
		}

		if ( $stateParams.page > 1 ) {
			query += '&page=' + $stateParams.page;
		}

		query += '&' + filteringContainer.getQueryString();

		return '/web/discover/games' + query;
	}

	var queryParams = '?price&os&browser&maturity&status&page&query';

	$urlMatcherFactoryProvider.type( 'gamesSection', {
		pattern: /featured|new|fresh|hot|best|worst|by\-date/
	} );

	$urlMatcherFactoryProvider.type( 'gamesCategory', {
		pattern: /arcade|action|adventure|rpg|strategy-sim|platformer|shooter|puzzle|sports|other/
	} );

	// Redirect old category URLs to new.
	$urlRouterProvider.when( '/games/{category:gamesCategory}', '/games/best/:category' );

	var subStates = {
		'section': '/{section:gamesSection}',
		'section-category': '/{section:gamesSection}/{category:gamesCategory}',
		'section-date': '/{section:gamesSection}/{date}',
	};

	angular.forEach( subStates, function( url, state )
	{
		$stateProvider.state( 'discover.games.list.' + state, {
			url: url + queryParams,
			controller: 'Discover.Games.List.CategoryCtrl',
			controllerAs: 'categoryCtrl',
			templateUrl: '/app/views/discover/games/list/category/category.html',
			resolve: {
				payload: function( $stateParams, Api, History_Cache, filteringContainer )
				{
					return filteringContainer.init( 'discover.games.list.' + state, $stateParams )
						.then( function()
						{
							return History_Cache.cache( Api.sendRequest( buildQuery( $stateParams, filteringContainer ) ) );
						} );
				}
			}
		} );
	} );
} );
