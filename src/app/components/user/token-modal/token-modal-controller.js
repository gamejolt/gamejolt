angular.module( 'App.User.TokenModal' ).controller( 'User_TokenModalCtrl', function( $scope, $modalInstance, Api, Growls )
{
	var _this = this;

	this.token = undefined;
	this.isChanging = false;

	Api.sendRequest( '/web/dash/token' ).then( function( response )
	{
		_this.token = response.token;
	} )
	.catch( function()
	{
		Growls.error( 'Could not get your token.' );
	} );

	this.showChangeForm = function()
	{
		this.isChanging = true;
	};

	this.onTokenChanged = function( formModel )
	{
		this.isChanging = false;
		this.token = formModel.token;
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
