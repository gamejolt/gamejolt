angular.module( 'App.Chat' ).service( 'Chat_RoomDetailsModal', function( $modal )
{
	this.show = function( room )
	{
		var modalInstance = $modal.open( {
			template: require( '!html-loader!./room-details-modal.html' ),
			controller: 'Chat_RoomDetailsModalCtrl',
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
