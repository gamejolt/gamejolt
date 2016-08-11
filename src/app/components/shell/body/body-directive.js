angular.module( 'App.Shell' ).directive( 'gjShellBody', function()
{
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/app/components/shell/body/body.html',
		controller: function( $scope, $element, $window, Scroll, Api, GameCollection )
		{
			$scope.$applyAsync( function()
			{
				// We have to set the scroll offset so that it knows that we have a fixed navbar.
				var elem = $window.document.getElementById( 'shell-body' );
				Scroll.setOffsetTop( parseInt( $window.getComputedStyle( elem ).marginTop, 10 ) );
			} );

			Api.sendRequest( '/web/library' )
				.then( function( response )
				{
					$scope.$ctrl = {
						collections: GameCollection.populate( response.collections ),
						followedNotificationCount: response.followedNotificationCount || 0,
						followedCollection: response.followedCollection ? new GameCollection( response.followedCollection ) : null,
						developerCollection: response.developerCollection ? new GameCollection( response.developerCollection ) : null,
						ownedCollection: response.ownedCollection ? new GameCollection( response.ownedCollection ) : null,
						bundleCollections: GameCollection.populate( response.bundleCollections ),
					};
				} );
		},
	};
} );
