angular.module( 'App.Offline.Alert' ).directive( 'gjOfflineAlert', function( Connection )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/offline/alert/alert.html',
		scope: {},
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			var _this = this;

			$scope.Connection = Connection;

			this.shouldShow = false;
			this.forceHidden = false;

			$scope.$watch( 'Connection.isOnline', function( isOnline )
			{
				_this.shouldShow = !isOnline;

				// Always reset the force hidden state when we switch to offline.
				if ( !isOnline ) {
					_this.forceHidden = false;
				}
			} );
		}
	};
} );
