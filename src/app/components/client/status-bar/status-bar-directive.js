angular
	.module('App.Client.StatusBar')
	.directive('gjClientStatusBar', function() {
		return {
			restrict: 'E',
			scope: {},
			template: require('!html-loader!./status-bar.html'),
			controllerAs: 'ctrl',
			controller: function(
				$scope,
				Client_Library,
				Client_Launcher,
				Client_Installer,
				LocalDb_Package
			) {
				var _this = this;

				$scope.LocalDb_Package = LocalDb_Package;
				$scope.Client_Launcher = Client_Launcher;
				$scope.Client_Library = Client_Library;
				$scope.Client_Installer = Client_Installer;

				this.isShowing = false;

				$scope.$watch(
					'Client_Installer.numPatching || Client_Launcher.currentlyPlaying.length',
					function(isShowing) {
						_this.isShowing = isShowing;

						if (isShowing) {
							window.document.body.classList.add('status-bar-visible');
						} else {
							window.document.body.classList.remove('status-bar-visible');
						}
					}
				);

				$scope.$on('$destroy', function() {
					window.document.body.classList.remove('status-bar-visible');
				});
			},
		};
	});
