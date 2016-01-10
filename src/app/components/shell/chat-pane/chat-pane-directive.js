angular.module( 'App.Shell' ).directive( 'gjShellChatPane', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/chat-pane/chat-pane.html',
		scope: true,
	};
} );
