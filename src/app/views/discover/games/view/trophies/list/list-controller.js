angular.module( 'App.Views' ).controller( 'Discover.Games.View.Trophies.ListCtrl', function( $scope, $stateParams, Translate, Game_Trophy, User_GameTrophy, payload )
{
	var _this = this;

	$scope.App.title = Translate.pageTitle( 'game.trophies.page_title', { game: $scope.gameCtrl.game.title } );

	this.trophies = Game_Trophy.populate( payload.trophies );
	this.achieved = payload.achievedTrophies ? User_GameTrophy.populate( payload.achievedTrophies ) : [];
	this.experience = payload.experienceAchieved || 0;
	this.showInvisibleTrophyMessage = payload.showInvisibleTrophyMessage || false;

	this.achievedIndexed = Game_Trophy.indexAchieved( this.achieved );
	this.filteredTrophies = Game_Trophy.splitAchieved( this.trophies, this.achievedIndexed );

	this.currentFilter = 'all';
} );
