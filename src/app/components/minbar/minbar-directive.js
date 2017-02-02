angular.module( 'App.Minbar' ).directive( 'gjMinbar', function( Minbar, Screen )
{
	return {
		restrict: 'E',
		scope: {},
		template: require( '!html-loader!./minbar.html' ),
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope )
		{
			$scope.Minbar = Minbar;
			$scope.Screen = Screen;

			this.onItemClick = function( item, $event )
			{
				if ( item.onClick ) {
					item.onClick( $event );
				}
			};
		}
	};
} );
