angular.module( 'App.Forum.PostList' ).directive( 'gjForumPostListReplies', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./replies.html' ),
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
