angular.module( 'App.Views' ).controller( 'Discover.Games.View.Devlog.ListCtrl', function( $scope, $state, $stateParams, App, Meta )
{
	App.title = 'Devlog for ' + $scope.gameCtrl.game.title;
	Meta.description = 'View all the latest devlog posts for ' + $scope.gameCtrl.game.title + ' on Game Jolt';
} );
