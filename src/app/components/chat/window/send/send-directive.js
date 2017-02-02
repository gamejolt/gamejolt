angular.module( 'App.Chat' ).directive( 'gjChatWindowSend', function( $rootScope )
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./send.html' ),
		scope: true,
		controllerAs: 'ctrl',
		controller: function( $element, Chat )
		{
			this.message = '';
			this.multiLineMode = false;

			this.onChange = function()
			{
				// If they remove whole message, remove multi-line mode.
				if ( this.multiLineMode && this.message.length === 0 ) {
					this.multiLineMode = false;
				}
			};

			this.shiftEnter = function( $event )
			{
				this.multiLineMode = true;

				// Hacky. Triggers an auto scroll through an event.
				// This is since the send box moves up a bit, it is no longer scrolled correctly.
				$rootScope.$broadcast( 'Chat.triggerAutoScroll' );
			};

			this.ctrlEnter = function( $event )
			{
				$event.preventDefault();
				this.sendMessage();
			};

			this.enter = function( $event )
			{
				if ( !this.multiLineMode ) {
					$event.preventDefault();
					this.sendMessage();
				}
			};

			this.sendMessage = function()
			{
				var message = this.message;
				Chat.client.queueMessage( message );

				this.message = '';
				this.multiLineMode = false;
			};
		}
	};
} );
