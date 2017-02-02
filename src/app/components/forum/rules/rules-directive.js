angular.module( 'App.Forum.Rules' ).directive( 'gjForumRules', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./rules.html' ),
		scope: {},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
