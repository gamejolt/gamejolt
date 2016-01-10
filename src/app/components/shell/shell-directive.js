angular.module( 'App.Shell' ).directive( 'gjShell', function( $rootScope, Screen, App, Shell )
{
	return {
		restrict: 'E',
		scope: true,
		transclude: true,
		templateUrl: '/app/components/shell/shell.html',
		link: function( scope, element )
		{
			scope.Shell = Shell;
		},
	};
} );
