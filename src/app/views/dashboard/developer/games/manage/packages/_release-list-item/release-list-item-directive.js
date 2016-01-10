angular.module( 'App.Views' ).directive( 'gjDashReleaseListItem', function( Game_Release )
{
	return {
		restrict: 'E',
		templateUrl: '/app/views/dashboard/developer/games/manage/packages/_release-list-item/release-list-item.html',
		scope: {},
		bindToController: {
			release: '=gjRelease',
		},
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			$scope.Game_Release = Game_Release;
		}
	};
} );
