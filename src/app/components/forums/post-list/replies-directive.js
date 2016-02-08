angular.module( 'App.Forums.PostList' ).directive( 'gjForumsPostListReplies', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/post-list/replies.html',
		scope: {
			topic: '=',
			replies: '=',
			repliesCount: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
