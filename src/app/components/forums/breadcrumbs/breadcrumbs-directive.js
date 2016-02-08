angular.module( 'App.Forums.Breadcrumbs' ).directive( 'gjForumsBreadcrumbs', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/breadcrumbs/breadcrumbs.html',
		scope: {
			channel: '=?',
			page: '@?',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
