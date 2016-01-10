angular.module( 'App.Game.Grid' ).directive( 'gjGameGrid', function()
{
	return {
		restrict: 'E',
		scope: {
			games: '=gjGames',
			gamesCount: '=gjGamesCount',
			perPage: '=gjPerPage',
			linkTo: '@gjLinkTo'
		},
		templateUrl: '/app/components/game/grid/grid.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $stateParams, $scope, Scroll )
		{
			$scope.Scroll = Scroll;
			this.currentPage = $stateParams.page || 1;
		}
	};
} );
