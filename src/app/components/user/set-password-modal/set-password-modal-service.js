angular.module( 'App.User.SetPasswordModal' ).service( 'User_SetPasswordModal', function( $modal )
{
	this.show = function()
	{
		var modalInstance = $modal.open( {
			size: 'sm',
			templateUrl: '/app/components/user/set-password-modal/set-password-modal.html',
			controller: 'User_SetPasswordModalCtrl',
			controllerAs: 'modalCtrl'
		} );

		return modalInstance.result;
	};
} );

