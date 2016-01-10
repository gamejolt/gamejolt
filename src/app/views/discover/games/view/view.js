angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.games.view', {
		abstract: true,
		url: '/{slug:string}/{id:int}',
		controller: 'Discover.Games.ViewCtrl',
		controllerAs: 'gameCtrl',
		templateUrl: '/app/views/discover/games/view/view.html',
		resolve: {
			gamePayload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/games/' + $stateParams.id );
			},

			// We need to resolve the instantiated game so that we can set up the
			// view state with it in the onEnter function.
			game: function( Game, gamePayload )
			{
				return new Game( gamePayload.game );
			},

			// Used to sync the client DB with latest game info.
			clientSync: function( $injector, Environment, gamePayload )
			{
				if ( !Environment.isClient ) {
					return;
				}
				
				// Only sync if it's in library.
				var game = gamePayload.game;
				return $injector.get( 'LocalDb_Game' ).fetch( game.id )
					.then( function( localGame )
					{
						if ( localGame ) {
							return $injector.get( 'LocalDb_Sync' ).syncGame( game.id, game );
						}
					} );
			}
		},
		onEnter: function( Game_ViewState, game )
		{
			Game_ViewState.setGame( game );
		},
		onExit: function( Game_ViewState )
		{
			Game_ViewState.clear();
		}
	} );
} );
