angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/view/:id', '/dashboard/games/:id/overview' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.overview', {
		url: '',
		controller: 'Dashboard.Developer.Games.Manage.Game.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/overview/overview.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/overview/' + $stateParams.id );
			}
		}
	} );
} )
.run( function( $state, Payload, Location )
{
	// If there is any sort of error while trying to go to the game dashboard, we want to direct instead to the game page.
	// This usually happens if someone shares their dashboard link instead of their game page link.
	// This is a bit brute force, as we will also redirect if the game doesn't exist, but in that case the game overview state will catch it.
	Payload.addErrorHandler( function( event, toState, toParams, fromState, fromParams, error )
	{
		// Sadly, we don't have the slug, so we depend on the location enforcer to fill that in after redirecting.
		if ( toState.name == 'dashboard.developer.games.manage.game.overview' ) {
			Location.redirectState( 'discover.games.view.overview', { slug: 'game', id: toParams.id } );

			// Don't do the default error handling for the payload.
			event.preventDefault();
		}
	} );
} );
