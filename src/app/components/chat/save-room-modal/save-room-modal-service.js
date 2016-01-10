angular.module( 'App.Chat' ).service( 'Chat_SaveRoomModal', function( $modal )
{
	this.show = function( room )
	{
		room = room || null;

		var modalInstance = $modal.open( {
			templateUrl: '/app/components/chat/save-room-modal/save-room-modal.html',
			controller: 'Chat_SaveRoomModalCtrl',
			controllerAs: 'modalCtrl',
			resolve: {
				room: function()
				{
					return room;
				}
			}
		} );

		return modalInstance.result;
	};
} );
