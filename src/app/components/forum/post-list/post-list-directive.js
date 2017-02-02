angular.module( 'App.Forum.PostList' ).directive( 'gjForumPostList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./post-list.html' ),
		scope: {
			topic: '=',
			posts: '=',
			userPostCounts: '=',
			isReplies: '=?',
			onReply: '&?',
		},
		bindToController: true,
		controllerAs: 'listCtrl',
		controller: function()
		{
			this.showingReplies = {};
			this.replies = {};
			this.replyCounts = {};
		},
	}
} );
