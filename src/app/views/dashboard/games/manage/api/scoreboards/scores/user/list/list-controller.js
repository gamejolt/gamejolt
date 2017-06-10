angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.User.ListCtrl', function(
	$scope, $state, App, User, Game_ScoreTable, User_GameScore, ModalConfirm, Growls, gettextCatalog, payload )
{
	var _this = this;

	this.user = new User( payload.user );
	this.scores = User_GameScore.populate( payload.scores );
	this.scoreTable = new Game_ScoreTable( payload.scoreTable );

	App.title = gettextCatalog.getString( 'dash.games.scores.user.list.page_title', {
		game: $scope.manageCtrl.game.title,
		user: this.user.display_name,
		table: this.scoreTable.name,
	} );

	this.onScoreRemoved = function( score )
	{
		_.remove( this.scores, { id: score.id } );
	};

	this.removeAll = function()
	{
		return ModalConfirm.show( gettextCatalog.getString( 'dash.games.scores.user.list.remove_confirmation' ) )
			.then( function()
			{
				return _this.scoreTable.$removeAllUserScores( _this.user.id );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'dash.games.scores.user.list.remove_growl', {
						user: _this.user.display_name,
						table: _this.scoreTable.name,
					} ),
					gettextCatalog.getString( 'dash.games.scores.user.list.remove_growl_title', {
						user: _this.user.display_name,
						table: _this.scoreTable.name,
					} )
				);

				$state.go( 'dash.games.manage.api.scoreboards.scores.list', { table: _this.scoreTable.id } );
			} );
	};
} );
