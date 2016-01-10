angular.module( 'App.Shell' ).directive( 'gjShellFooter', function( Screen, Environment )
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/shell/footer/footer.html',
		scope: true,
		link: function( scope )
		{
			scope.Screen = Screen;
			scope.Environment = Environment;
			scope.curDate = new Date();
		}
	};
} );
