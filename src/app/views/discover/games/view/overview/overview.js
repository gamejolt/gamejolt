angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/games/{category:arcade|action|adventure|rpg|strategy-sim|platformer|shooter|puzzle|sports|other}/{slug:string}/{id:int}', '/games/:slug/:id' );

	$stateProvider.state( 'discover.games.view.overview', {
		url: '^/games/{slug:string}/{id:int}?comment_page',
		controller: 'Discover.Games.View.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/games/view/overview/overview.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/overview/' + $stateParams.id );
			},
			tick: function( HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'game-view', $stateParams.id );
			},

			// We could skip these if the games payload didn't get any scores/trophies.
			// However, if we don't include the games payload as an injection to the resolve
			// they all happen in parallel. So while it's more load on the server, it should
			// be faster for the user.
			scoresPayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/scores/overview/' + $stateParams.id );
			},
			trophiesPayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/trophies/overview/' + $stateParams.id );
			},

			// Used to sync the client DB with latest package info.
			// clientSync: function( $injector, $q, Environment, payload )
			// {
			// 	if ( !Environment.isClient ) {
			// 		return;
			// 	}

			// 	if ( !payload.packages.length ) {
			// 		return;
			// 	}

			// 	// Only sync if it's in library.
			// 	var updatePromises = payload.packages.map( function( _package )
			// 	{
			// 		return $injector.get( 'LocalDb_Package' ).fetch( _package.id )
			// 			.then( function( localPackage )
			// 			{
			// 				if ( localPackage ) {
			// 					return $injector.get( 'LocalDb_Sync' ).syncPackage( _package.id, payload );
			// 				}
			// 			} );
			// 	} );

			// 	return $q.all( updatePromises );
			// }
		},
		onEnter: function( Game_ViewState )
		{
			Game_ViewState.showExtended();
		},
		onExit: function( Game_ViewState )
		{
			Game_ViewState.hideExtended();
		}
	} );
} );
