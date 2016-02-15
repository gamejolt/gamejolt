angular.module( 'App.Forum.PostList' ).directive( 'gjForumPostListReplies', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/post-list/replies.html',
		scope: {
			topic: '=',
			replies: '=',
			repliesCount: '=',
			userPostCounts: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: angular.noop,
	}
} );
