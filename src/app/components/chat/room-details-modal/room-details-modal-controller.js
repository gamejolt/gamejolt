angular.module( 'App.Chat' ).controller( 'Chat_RoomDetailsModalCtrl', function( $modalInstance, room )
{
	this.room = room;

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
