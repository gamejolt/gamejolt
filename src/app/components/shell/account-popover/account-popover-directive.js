angular.module( 'App.Shell' ).directive( 'gjShellAccountPopover', function( $injector, App, Api, Screen, Popover, User_TokenModal, Connection, Environment )
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
			var _this = this;

			$scope.App = App;
			$scope.Screen = Screen;
			$scope.Popover = Popover;
			$scope.Connection = Connection;
			$scope.Environment = Environment;

			if ( Environment.isClient ) {
				$scope.Client = $injector.get( 'Client' );
			}

			this.isShown = false;
			this.walletAmount = false;

			this.onShow = function()
			{
				this.isShown = true;
				this.getWallet();
			};

			this.onHide = function()
			{
				this.isShown = false;
			};

			this.logout = function()
			{
				App.logout();
			};

			this.showToken = function()
			{
				User_TokenModal.show();
			};

			this.getWallet = function()
			{
				Api.sendRequest( '/web/dash/funds/wallet', { detach: true } )
					.then( function( response )
					{
						_this.walletAmount = response.amount;
					} );
			};
		}
	};
} );
