angular.module( 'App.Views' ).controller( 'Discover.Games.View.Comments.ListCtrl', function( $scope, $state, $stateParams, App, Meta )
{
	App.title = 'Comments for ' + $scope.gameCtrl.game.title;
	Meta.description = 'View all the comments for ' + $scope.gameCtrl.game.title + ' on Game Jolt';
} );
