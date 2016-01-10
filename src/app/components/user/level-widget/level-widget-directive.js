angular.module( 'App.User.LevelWidget' ).directive( 'gjUserLevelWidget', function()
{
	return {
		restrict: 'E',
		scope: {
			user: '=gjUser',
		},
		templateUrl: '/app/components/user/level-widget/level-widget.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
