angular.module( 'App.Game.RatingGrowl' ).controller( 'Game_RatingGrowlCtrl', function( $scope, $growlMessage, game )
{
	var _this = this;

	this.game = game;

	// Close the modal as soon as they rate the game.
	// We set up on $on event so that we get notified even if they rate the game from the game page and not the modal.
	this.rating = null;
	$scope.$on( 'onGameRatingChange', function( event, gameId )
	{
		if ( gameId == _this.game.id ) {
			$growlMessage.close();
		}
	} );
} );
