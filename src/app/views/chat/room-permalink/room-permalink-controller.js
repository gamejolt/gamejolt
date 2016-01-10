angular.module( 'App.Views' ).controller( 'Chat.RoomPermalinkCtrl', function( $q, $rootScope, $scope, $timeout, Chat, permalinkPayload )
{
	var promise = $q.resolve();

	if ( !Chat.client.connected ) {
		promise = $q( function( resolve, reject )
		{
			var watcher = $rootScope.$on( 'Chat.connected', function()
			{
				resolve();
				watcher = null;
			} );

			// Gotta clean up.
			$scope.$on( '$destroy', function()
			{
				if ( watcher ) {
					watcher();
				}
			} );
		} );
	}

	promise.then( function()
	{
		Chat.client.enterRoom( permalinkPayload.room.id, true );
	} );
} );
