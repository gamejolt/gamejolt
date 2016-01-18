angular.module( 'App.Shell' ).directive( 'gjShellFooter', function( $window, Screen, Environment )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/footer/footer.html',
		scope: {},
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			$scope.Screen = Screen;
			$scope.Environment = Environment;
			this.curDate = new Date();

			// We have to refresh the whole browser when language changes so that
			// all the new language strings get picked up.
			this.onLangChange = function()
			{
				if ( !Environment.isClient ) {
					$window.location.reload();
				}
				else {
					require( 'nw.gui' ).Window.get().reloadDev();
				}
			};
		}
	};
} );
