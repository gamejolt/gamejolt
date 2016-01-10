angular.module( 'App.Shell' ).directive( 'gjShellBody', function()
{
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/app/components/shell/body/body.html',
		controller: function( $scope, $element, $window, Scroll )
		{
			$scope.$applyAsync( function()
			{
				// We have to set the scroll offset so that it knows that we have a fixed navbar.
				var elem = $window.document.getElementById( 'shell-body' );
				Scroll.setOffsetTop( parseInt( $window.getComputedStyle( elem ).marginTop, 10 ) );
			} );
		},
	};
} );
