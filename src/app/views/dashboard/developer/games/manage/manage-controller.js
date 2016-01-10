angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.ManageCtrl', function(
	$scope, $state, $translate, Translate, Growls, ModalConfirm, Game, managePayload )
{
	var _this = this;

	$scope.Game = Game;

	this.game = new Game( managePayload.game );
	this.shouldShowGameCover = false;

	this.removeGame = function()
	{
		ModalConfirm.show( $translate.instant( 'dash.games.remove_confirmation' ) )
			.then( function()
			{
				return _this.game.$remove();
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.removed' );
				$state.go( 'dashboard.overview' );
			} );
	};
} );
