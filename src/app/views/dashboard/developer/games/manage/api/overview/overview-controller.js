angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.OverviewCtrl', function( $scope, $window, Translate, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.games.api.overview.page_title', { game: $scope.manageCtrl.game.title } );

	this.sessionStats = payload.sessionStats;

	var fields = [
		'numActiveTrophies', 'totalTrophyExp', 'totalAchievedTrophies', 'totalUsersWithTrophies',
		'totalScores', 'totalUsersWithScores',
		'numActiveSessions',
		'numGlobalItems',
	];

	fields.forEach( function( field )
	{
		_this[ field ] = payload[ field ] || 0;
	} );
} );
