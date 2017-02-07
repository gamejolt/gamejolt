angular.module( 'App.Chat' ).directive( 'gjChatWindows', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./windows.html' ),
		controller: function( $scope, Chat )
		{
			$scope.client = Chat.client;
		}
	};
} );
