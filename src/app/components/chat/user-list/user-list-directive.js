angular.module( 'App.Chat' ).directive( 'gjChatUserList', function()
{
	return {
		restrict: 'E',
		scope: {
			room: '=?chatUserListRoom',
			showPm: '=?chatUserListShowPm',
			showModTools: '=?chatUserListShowModTools',
			focusFilter: '=?chatUserListFocusFilter'
		},
		templateUrl: '/app/components/chat/user-list/user-list.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $attrs, $parse, $state, Chat, ChatConfig )
		{
			var _this = this;

			$scope.Chat = Chat;
			$scope.ChatConfig = ChatConfig;

			var client = Chat.client;
			this.filterQuery = '';
			this.notifications = client.notifications;

			// We can't let anything be undefined or it won't bind-once.
			if ( angular.isUndefined( this.showModTools ) ) {
				this.showModTools = false;
			}

			if ( angular.isUndefined( this.showPm ) ) {
				this.showPm = false;
			}

			if ( angular.isUndefined( this.room ) ) {
				this.room = null;
				this.showModTools = false;
			}

			// Doing it as an explicit watch, rather than a scope variable allows us to
			// filter the input before passing it in.
			this.users = [];
			$scope.$watchCollection( function()
			{
				return $parse( $attrs.chatUserListUsers )( $scope.$parent );
			},
			function( users )
			{
				_this.users = users;
			} );

			// We do it this way we can reduce watches and freeze the URL for the user.
			this.getUserProfileUrl = function( user )
			{
				return $state.href( 'profile.overview', { slug: user.username, id: user.id } )
			};

			this.onUserClick = function( user, $event )
			{
				// Otherwise, the default is just to follow the link, which is fine.
				if ( !this.showPm ) {
					return;
				}

				$event.preventDefault();
				$event.stopPropagation();

				// If they are clicking on the user that they're already talking to, then we want to close
				// the chat. Otherwise, start a PM to them.
				if ( !client.targetUser || client.targetUser.id != user.id ) {
					client.enterRoom( user.roomId, true );
				}
				else if ( client.targetUser && client.targetUser.id == user.id ) {
					client.minimizeRoom();
				}
			};

			this.canModerate = function( user )
			{
				if ( !this.room || !this.showModTools ) {
					return false;
				}

				return client.canModerate( this.room, user );
			};

			this.moderateUser = function( $event, user )
			{
				$event.stopPropagation();
				$event.preventDefault();

				// Make sure they refresh in the list so mod tools can show for them.
				if ( this.moderatingUser ) {
					client.usersOnline[ this.room.id ].touch( this.moderatingUser );
				}
				client.usersOnline[ this.room.id ].touch( user );

				if ( this.moderatingUser && this.moderatingUser.id == user.id ) {
					this.moderatingUser = null;
				}
				else {
					this.moderatingUser = user;
				}
			};

			this.mod = function( user )
			{
				if ( !this.room || !this.showModTools ) {
					return;
				}
				client.mod( user.id, this.room.id );
			};

			this.demod = function( user )
			{
				if ( !this.room || !this.showModTools ) {
					return;
				}
				client.demod( user.id, this.room.id );
			};

			this.mute = function( user )
			{
				if ( !this.room || !this.showModTools ) {
					return;
				}
				client.mute( user.id, this.room.id );
			};

			this.unmute = function( user )
			{
				if ( !this.room || !this.showModTools ) {
					return;
				}
				client.unmute( user.id, this.room.id );
			};
		}
	};
} );
