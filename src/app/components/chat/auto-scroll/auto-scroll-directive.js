angular.module( 'App.Chat' ).directive( 'gjChatAutoScroll', function( $timeout, Screen )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			var shouldScroll = true;

			function scroll( newVal )
			{
				// Put it out of the digest loop so DOM updates.
				// Don't digest.
				$timeout( function()
				{
					// Only auto scroll if we should.
					if ( shouldScroll ) {
						element.scrollTop( element[0].scrollHeight + 10000 );
					}
				}, 0, false );
			}

			// Attempt to scroll any time our watched variable changes.
			// Also update if the screen resizes since the view may have changed size and shifted things around.
			scope.$watch( attrs.gjChatAutoScroll, scroll );
			Screen.setResizeSpy( scope, scroll );
			scope.$on( 'Chat.triggerAutoScroll', scroll );

			/**
			 * We watch when they scroll to see if they've moved away from the bottom of the view.
			 * If they have, then we shouldn't autoscroll until they scroll back to the bottom.
			 */
			element.on( 'scroll', function()
			{
				// We skip checking the scroll if the element isn't scrollable yet.
				// This'll be the case if the height of the element is less than its scroll height.
				if ( element[0].scrollHeight < element[0].offsetHeight ) {
					return;
				}

				if ( element[0].scrollHeight - (element[0].scrollTop + element[0].offsetHeight) > 30 ) {
					shouldScroll = false;
				}
				else {
					shouldScroll = true;
				}
			} );
		}
	};
} );
