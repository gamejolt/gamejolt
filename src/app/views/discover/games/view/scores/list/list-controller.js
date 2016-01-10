angular.module( 'App.Views' ).controller( 'Discover.Games.View.Scores.ListCtrl', function( $scope, $state, $stateParams, Translate, AutoScroll, Game_ScoreTable, User_GameScore, payload )
{
	$scope.App.title = Translate.pageTitle( 'game.scores.page_title', { game: $scope.gameCtrl.game.title } );

	this.type = $stateParams.type;

	this.scoreTables = payload.scoreTables ? Game_ScoreTable.populate( payload.scoreTables ) : [];
	this.scoreTable = payload.scoreTable ? new Game_ScoreTable( payload.scoreTable ) : undefined;
	this.scores = payload.scores ? User_GameScore.populate( payload.scores ) : [];
	this.userBestScore = payload.userBestScore ? new User_GameScore( payload.userBestScore ) : undefined;
	this.userScorePlacement = payload.userScorePlacement || undefined;
	this.userScoreExperience = payload.userScoreExperience || undefined;

	// Even.
	this.scoresLeft = this.scores.filter( function( score, i )
	{
		return i % 2 == 0;
	} );

	// Odd.
	this.scoresRight = this.scores.filter( function( score, i )
	{
		return i % 2 == 1;
	} );
} );
