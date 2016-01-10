angular.module( 'App.Client.InstallProgress' ).directive( 'gjClientInstallProgress', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/client/install-progress/install-progress.html',
		scope: {
			localPackage: '=localPackage',
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, LocalDb_Package )
		{
			var _this = this;

			$scope.LocalDb_Package = LocalDb_Package;

			this.progressKey = null;
			this.shouldShowSpeed = true;

			function handleState( state )
			{
				if ( angular.isUndefined( state ) ) {
					return;
				}

				_this.shouldShowSpeed = false;
				if ( state == LocalDb_Package.DOWNLOADING ) {
					_this.progressKey = 'download_progress';
					_this.shouldShowSpeed = true;
				}
				else if ( state == LocalDb_Package.UNPACKING ) {
					_this.progressKey = 'unpack_progress';
				}
				else {
					_this.progressKey = null;
				}
			}

			$scope.$watch( 'ctrl.localPackage.install_state', handleState );
			$scope.$watch( 'ctrl.localPackage.update_state', handleState );
		}
	};
} );
