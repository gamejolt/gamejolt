angular.module( 'App.Forum.Breadcrumbs' ).directive( 'gjForumBreadcrumbs', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/breadcrumbs/breadcrumbs.html',
		scope: {
			channel: '=?',
			page: '@?',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
