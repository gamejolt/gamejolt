angular.module( 'App.Client.Launcher' ).controller( 'Client_Launcher_FailedModalCtrl', function( $modalInstance, Device, package )
{
	this.package = package;
	this.os = Device.os();
	this.arch = Device.arch();

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
