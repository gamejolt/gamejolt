angular.module( 'App.Post.List' ).directive( 'gjPostList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/post/list/list.html',
		scope: {},
		bindToController: {
			items: '=postListItems',
		},
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
