angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.ManageCtrl', function(
	$scope, $state, Growls, ModalConfirm, Game, gettextCatalog, managePayload )
{
	var _this = this;

	$scope.Game = Game;

	this.game = new Game( managePayload.game );
	this.shouldShowGameCover = false;

	this.removeGame = function()
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( function()
			{
				return _this.game.$remove();
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.removed_growl' ),
					gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				$state.go( 'dashboard.main.overview' );
			} );
	};
} );
