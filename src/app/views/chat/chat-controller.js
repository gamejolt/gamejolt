angular.module( 'App.Views' ).controller( 'ChatCtrl', function( $scope, App, Chat_Room, Shell, Chat, Chat_RoomDetailsModal, payload )
{
	var _this = this;

	App.title = 'Indie Game Chat';

	this.rooms = Chat_Room.populate( payload.rooms );
	this.userCounts = _.indexBy( payload.userCounts, 'roomId' );

	this.enterRoom = function( room )
	{
		Chat.client.enterRoom( room.id, true );
	};

	this.viewDetails = function( room )
	{
		Chat_RoomDetailsModal.show( room );
	};
} );
