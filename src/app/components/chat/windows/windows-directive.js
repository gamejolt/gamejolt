angular.module( 'App.Chat' ).directive( 'gjChatWindows', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/chat/windows/windows.html',
		controller: function( $scope, Chat )
		{
			$scope.client = Chat.client;
		}
	};
} );
