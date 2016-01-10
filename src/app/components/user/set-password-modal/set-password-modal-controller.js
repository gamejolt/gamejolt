angular.module( 'App.User.SetPasswordModal' ).controller( 'User_SetPasswordModalCtrl', function( $scope, $modalInstance )
{
	this.onPasswordSet = function()
	{
		$modalInstance.close();
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
