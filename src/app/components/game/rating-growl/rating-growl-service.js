angular.module( 'App.Game.RatingGrowl' ).service( 'Game_RatingGrowl', function( App, Api, Growls )
{
	this.show = function( game )
	{
		// Don't show when not logged in.
		if ( !App.user ) {
			return;
		}

		// Don't show if ratings are disabled for the game.
		if ( !game.ratings_enabled || !game.can_user_rate ) {
			return;
		}

		// Don't show when this is the developer of the game.
		if ( App.user.id == game.developer.id ) {
			return;
		}

		Api.sendRequest( '/web/discover/games/ratings/get-user-rating/' + game.id, null, { detach: true } )
			.then( function( payload )
			{
				// If there is a rating for this user already, don't show the growl.
				if ( payload.rating ) {
					return;
				}

				Growls.info( {
					sticky: true,
					templateUrl: '/app/components/game/rating-growl/rating-growl.html',
					controller: 'Game_RatingGrowlCtrl',
					resolve: {
						game: function()
						{
							return game;
						}
					}
				} );
			} );
	};
} );
