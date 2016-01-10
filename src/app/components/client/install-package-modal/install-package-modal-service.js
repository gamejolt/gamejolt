angular.module( 'App.Client.InstallPackageModal' ).service( 'Client_InstallPackageModal', function( $modal )
{
	this.show = function( game )
	{
		var modalInstance = $modal.open( {
			templateUrl: '/app/components/client/install-package-modal/install-package-modal.html',
			controller: 'Client_InstallPackageModalCtrl',
			controllerAs: 'modalCtrl',
			resolve: {
				game: function()
				{
					return game;
				}
			}
		} );

		return modalInstance.result;
	};
} );

