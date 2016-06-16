angular.module( 'App.Views' ).controller( 'Dashboard.Account.LinkedAccountsCtrl', function( $scope, App, Growls, User_LinkedAccounts, User_SetPasswordModal, ModalConfirm, gettextCatalog )
{
	var _this = this;

	$scope.App.title = 'Linked Accounts';
	$scope.accountCtrl.heading = 'Linked Accounts';

	this.link = function( provider )
	{
		User_LinkedAccounts.link( provider );
	};

	this.unlink = function( provider )
	{
		User_LinkedAccounts.unlink( provider ).catch( function( error )
		{
			// If they don't have a password, we have to show them a modal to set it.
			if ( error == 'no-password' ) {
				User_SetPasswordModal.show().then( function()
				{
					Growls.success( 'Your new password has been set. You can now log in with it.', 'Password Set' );

					// Try to unlink again once they've set one!
					_this.unlink( provider );
				} );
			}
		} );
	};

	this.unlinkYoutube = function( channel )
	{
		ModalConfirm.show( gettextCatalog.getString( 'Are you you want to unlink this channel? Any videos you may have done as part of this channel will be removed from Game Jolt.' ) )
			.then( function()
			{
			} );
	};
} );
