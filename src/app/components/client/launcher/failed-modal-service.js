angular.module( 'App.Client.Launcher' ).service( 'Client_Launcher_FailedModal', function( $modal )
{
	this.show = function( package )
	{
		var modalInstance = $modal.open( {
			templateUrl: '/app/components/client/launcher/failed-modal.html',
			controller: 'Client_Launcher_FailedModalCtrl',
			controllerAs: '$ctrl',
			resolve: {
				package: function()
				{
					return package;
				}
			}
		} );

		return modalInstance.result;
	};
} );
