angular.module( 'App.Chat' ).directive( 'gjChatBubbles', function( Screen, Chat, Shell )
{
	return {
		restrict: 'E',
		scope: {},
		template: require( '!html-loader!./bubbles.html' ),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope )
		{
			var _this = this;

			$scope.Screen = Screen;
			$scope.Chat = Chat;
			$scope.Shell = Shell;

			this.activateRoom = function( roomId )
			{
				if ( !Shell.isRightPaneVisible ) {
					Shell.toggleRightPane();

					if ( !Chat.client.isInRoom( roomId ) ) {
						Chat.client.maximizeRoom( roomId );
					}
				}
				else {
					if ( Chat.client.isInRoom( roomId ) ) {
						Chat.client.minimizeRoom( roomId );
					}
					else {
						Chat.client.maximizeRoom( roomId );
					}
				}
			};

			this.closeRoom = function( roomId, event )
			{
				event.stopPropagation();
				Chat.client.leaveRoom( roomId );
			};
		}
	};
} );
