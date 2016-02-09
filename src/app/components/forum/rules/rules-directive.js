angular.module( 'App.Forum.Rules' ).directive( 'gjForumRules', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/rules/rules.html',
		scope: {},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
