angular.module( 'App.Shell' ).directive( 'gjShellMenuPopover', function( App, Screen, Popover, Environment )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/menu-popover/menu-popover.html',
		scope: {
			isShown: '=?',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope )
		{
			$scope.App = App;
			$scope.Screen = Screen;
			$scope.Popover = Popover;
			$scope.Environment = Environment;
		}
	};
} );
