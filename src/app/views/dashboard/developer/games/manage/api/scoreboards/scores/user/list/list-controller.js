angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.User.ListCtrl', function(
	$scope, $state, $translate, Translate, User, Game_ScoreTable, User_GameScore, ModalConfirm, payload )
{
	var _this = this;

	this.user = new User( payload.user );
	this.scores = User_GameScore.populate( payload.scores );
	this.scoreTable = new Game_ScoreTable( payload.scoreTable );

	Translate.pageTitle( 'dash.games.scores.user.list.page_title', {
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
		return ModalConfirm.show( $translate.instant( 'dash.games.scores.user.list.remove_confirmation' ) )
			.then( function()
			{
				return _this.scoreTable.$removeAllUserScores( _this.user.id );
			} )
			.then( function()
			{
				Translate.growl( 'success', 'dash.games.scores.user.list.remove', {
					user: _this.user.display_name,
					table: _this.scoreTable.name,
				} );

				$state.go( 'dashboard.developer.games.manage.api.scoreboards.scores.list', { table: _this.scoreTable.id } );
			} );
	};
} );
