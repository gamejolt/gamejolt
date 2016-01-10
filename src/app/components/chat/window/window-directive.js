angular.module( 'App.Chat' ).directive( 'gjChatWindow', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/chat/window/window.html',
		scope: {
			room: '=chatWindowRoom',
			users: '=?chatWindowUsers',
			messages: '=chatWindowMessages',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Chat, Chat_Room, Screen, Shell, ChatConfig, Chat_SaveRoomModal, Chat_RoomDetailsModal )
		{
			var _this = this;

			$scope.ChatConfig = ChatConfig;
			$scope.Screen = Screen;
			$scope.client = Chat.client;
			$scope.Chat_Room = Chat_Room;

			this.isShowingUsers = false;

			this.minimize = function()
			{
				Chat.client.minimizeRoom();
			};

			this.close = function()
			{
				Chat.client.leaveRoom( this.room.id );
			};

			this.showModTools = false;
			$scope.$watch( 'ctrl.room.isMod', function( isMod, prev )
			{
				if ( !Chat.client.currentUser || !Chat.client.isGroupRoom( _this.room ) ) {
					_this.showModTools = false;
					return;
				}

				if ( !!isMod || Chat.client.currentUser.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
					_this.showModTools = true;
				}
				else {
					_this.showModTools = false;
				}

				// Only if things have changed! Perf improvement.
				if ( isMod !== prev ) {

					// We gotta refresh the whole user list now so the mod tools get changed. Yikes!
					Chat.client.usersOnline[ _this.room.id ].touchAll();
				}
			} );

			// Closes chat completely.
			// When you click on the empty space behind the chat, we want to close the chat just
			// like you would when clicking the normal backdrop.
			this.closeChat = function()
			{
				Shell.toggleRightPane();
			};

			this.showEditRoomModal = function()
			{
				Chat_SaveRoomModal.show( this.room );
			};

			this.viewRoomDetails = function()
			{
				Chat_RoomDetailsModal.show( this.room );
			};

			this.toggleUsers = function()
			{
				this.isShowingUsers = !this.isShowingUsers;
			};
		}
	};
} );
