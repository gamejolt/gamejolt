angular.module( 'App.Shell' ).directive( 'gjShellAccountPopover', function( $injector, App, Screen, Popover, User_TokenModal, Connection, Environment )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/account-popover/account-popover.html',
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
			$scope.Connection = Connection;
			$scope.Environment = Environment;

			if ( Environment.isClient ) {
				$scope.Client = $injector.get( 'Client' );
			}

			this.logout = function()
			{
				App.logout();
			};

			this.showToken = function()
			{
				User_TokenModal.show();
			};
		}
	};
} );
