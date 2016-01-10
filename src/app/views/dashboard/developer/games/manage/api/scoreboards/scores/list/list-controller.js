angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.Scoreboards.Scores.ListCtrl', function(
	$scope, $state, Translate, AutoScroll, Game_ScoreTable, User_GameScore, payload )
{
	var _this = this;

	this.scoreTables = Game_ScoreTable.populate( payload.scoreTables );

	this.scoreTable = new Game_ScoreTable( payload.scoreTable );
	this.scores = User_GameScore.populate( payload.scores );

	this.selectedTable = _.find( this.scoreTables, { id: this.scoreTable.id } );

	Translate.pageTitle( 'dash.games.scores.list.page_title', {
		game: $scope.manageCtrl.game.title,
		table: this.scoreTable.name,
	} );

	this.changeTable = function( tableId )
	{
		AutoScroll.noScroll( true );
		$state.go( $state.current, { table: tableId } )
	};

	this.onScoreRemoved = function( score )
	{
		AutoScroll.noScroll( true );
		$state.reload( $state.current );
	};
} );
