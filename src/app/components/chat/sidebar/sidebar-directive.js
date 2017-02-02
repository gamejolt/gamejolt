angular.module( 'App.Chat' ).directive( 'gjChatSidebar', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./sidebar.html' ),
		scope: {},
		controllerAs: 'ctrl',
		controller: function( $scope, $timeout, Screen, Shell, Chat, Chat_SaveRoomModal, Chat_Room )
		{
			var _this = this;

			$scope.Shell = Shell;
			$scope.Screen = Screen;
			$scope.Chat = Chat;
			$scope.Chat_Room = Chat_Room;

			var client = Chat.client;
			$scope.client = client;

			/**
			 * When they click on a public room.
			 */
			this.onPublicRoomClicked = function( roomId )
			{
				// If they are clicking on the room that they're already in, then we want to close the chat.
				// If the chat they are clicking on is their minimized room, then we want to open it back up.
				// Otherwise enter the new room.
				client.enterRoom( roomId, true );
			};

			this.showCreateRoomModal = function()
			{
				Chat_SaveRoomModal.show().then( function( response )
				{
					if ( response.success ) {
						client.enterRoom( response.chatRoom.id, true );
					}
				} );
			};

			this.filterOnline = function( item )
			{
				return item.isOnline || client.notifications[ item.roomId ];
			};

			this.filterOffline = function( item )
			{
				return !item.isOnline;
			};
		}
	};
} );
