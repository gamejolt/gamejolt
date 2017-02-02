angular.module( 'App.User.LevelWidget' ).directive( 'gjUserLevelWidget', function()
{
	return {
		restrict: 'E',
		scope: {
			user: '=gjUser',
		},
		template: require( '!html-loader!./level-widget.html' ),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
