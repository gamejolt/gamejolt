angular.module( 'App.Views' ).controller( 'Discover.Channels.Channel.Games._FetchCtrl', function(
	$scope, $state, $stateParams, $timeout, $interval, App, Meta, Game, SplitTest, dateFilter, gettext, gettextCatalog, payload )
{
	var _this = this;
	var gamesCtrl = $scope.gamesCtrl;

	this.games = Game.populate( payload.games );
	gamesCtrl.processPayload( $stateParams, payload );
} );
