angular.module( 'App.Chat' ).controller( 'Chat_SaveRoomModalCtrl', function( $modalInstance, room )
{
	var _this = this;
	this.room = room;

	this.onSaved = function( response )
	{
		$modalInstance.close( response );
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
