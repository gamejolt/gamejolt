angular.module( 'App.Forums.PostList' ).directive( 'gjForumsPostList', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forums/post-list/post-list.html',
		scope: {
			topic: '=',
			posts: '=',
			isReplies: '=?',
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
