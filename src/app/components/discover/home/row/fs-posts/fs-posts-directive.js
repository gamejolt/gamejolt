angular.module( 'App.Views' ).directive( 'gjDiscoverHomeRowFsPosts', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/discover/home/row/fs-posts/fs-posts.html',
		controller: function( $scope, Screen )
		{
			$scope.Screen = Screen;

			$scope.ctrl.desktopPages = _.chunk( $scope.ctrl.posts, 3 );
			$scope.ctrl.smPages = _.chunk( $scope.ctrl.posts, 2 );
			$scope.ctrl.xsPosts = _.take( $scope.ctrl.posts, 3 );
		}
	};
} );
