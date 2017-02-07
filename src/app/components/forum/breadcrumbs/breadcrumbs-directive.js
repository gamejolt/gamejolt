angular.module( 'App.Forum.Breadcrumbs' ).directive( 'gjForumBreadcrumbs', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./breadcrumbs.html' ),
		scope: {
			channel: '=?',
			page: '@?',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
