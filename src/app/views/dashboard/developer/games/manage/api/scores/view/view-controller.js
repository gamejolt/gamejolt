angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Developer.Games.Manage.Api.Scores.ViewCtrl', function(
	$scope, $state, App, User_GameScore, Game_ScoreTable, ModalConfirm, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'dash.games.scores.view.page_title', { game: $scope.manageCtrl.game.title } );

	this.score = new User_GameScore( payload.score );
	this.scoreTable = new Game_ScoreTable( payload.scoreTable );

	this.removeScore = function( score )
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.scores.view.remove_confirmation' ) )
			.then( function()
			{
				return _this.score.$remove();
			} )
			.then( function()
			{
				$state.go( 'dashboard.developer.games.manage.api.scoreboards.scores.list', { table: _this.score.table_id } );
			} );
	};
} );
