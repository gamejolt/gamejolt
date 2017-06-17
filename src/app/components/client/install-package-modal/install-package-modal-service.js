angular
	.module('App.Client.InstallPackageModal')
	.service('Client_InstallPackageModal', function($modal) {
		this.show = function(game) {
			var modalInstance = $modal.open({
				template: require('!html-loader!./install-package-modal.html'),
				controller: 'Client_InstallPackageModalCtrl',
				controllerAs: 'modalCtrl',
				size: 'sm',
				resolve: {
					game: function() {
						return game;
					},
				},
			});

			return modalInstance.result;
		};
	});
