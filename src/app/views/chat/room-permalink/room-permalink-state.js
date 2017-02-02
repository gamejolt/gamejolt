angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'chat.room-permalink', {
		url: '^/c/:room',
		controller: 'Chat.RoomPermalinkCtrl',
		resolve: {
			permalinkPayload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/chat/rooms/' + $stateParams.room );
			}
		}
	} );
} );
