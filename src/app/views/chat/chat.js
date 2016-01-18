angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'chat', {
		url: '/chat',
		controller: 'ChatCtrl',
		controllerAs: 'chatCtrl',
		templateUrl: '/app/views/chat/chat.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			payload: function( Api )
			{
				return Api.sendRequest( '/web/chat/rooms' );
			}
		}
	} );
} );
