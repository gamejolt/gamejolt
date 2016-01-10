angular.module( 'App.Fireside.Post.List' ).directive( 'gjFiresidePostList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/fireside/post/list/list.html',
		scope: {},
		bindToController: {
			posts: '=firesidePosts'
		},
		controllerAs: 'ctrl',
		controller: angular.noop,
	};
} );
