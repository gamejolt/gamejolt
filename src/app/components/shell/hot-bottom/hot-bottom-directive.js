angular.module( 'App.Shell' ).directive( 'gjShellHotBottom', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/hot-bottom/hot-bottom.html',
		scope: true,
		transclude: true,
		controller: angular.noop,
	};
} );
