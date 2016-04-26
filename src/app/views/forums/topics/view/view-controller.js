angular.module( 'App.Views' ).controller( 'Forums.Topics.ViewCtrl', function( $state, $location, $timeout, $window, Environment, Forum_Post, Popover, Growls, AutoScroll, Scroll, Report_Modal )
{
	var _this = this;

	this.loginUrl = Environment.authBaseUrl + '/login?redirect=' + $window.encodeURIComponent( $location.absUrl() );

	this.onPostAdded = function( formModel, response )
	{
		// If their post was marked as spam, make sure they know.
		if ( formModel.status == Forum_Post.STATUS_SPAM ) {
			Growls.info( 'Your post has been marked for review. Please allow some time for it to show on the site.', 'Post Needs Review' );
		}

		// We want to either go to the correct page or stay on the current one but reload it to get all new posts.
		// Note that we scroll to the post as well.
		if ( response.page != this.currentPage ) {
			$state.go( $state.current, { page: response.page, '#': 'forum-post-' + formModel.id } );
		}
		else {
			AutoScroll.noScroll( true );
			$state.reload( 'forums.topics.view.page' ).then( function()
			{
				$location.replace().hash( 'forum-post-' + formModel.id );
			} );
		}
	};

	this.editTopic = function()
	{
		this.isEditingTopic = true;
		Popover.hideAll();
	};

	this.closeEditTopic = function()
	{
		this.isEditingTopic = false;
	};

	this.follow = function()
	{
		this.topic.$follow().then( function()
		{
			_this.isFollowing = true;
			++_this.followerCount;
		} );
	};

	this.unfollow = function()
	{
		this.topic.$unfollow().then( function()
		{
			_this.isFollowing = false;
			--_this.followerCount;
		} );
	};

	this.pageChange = function( page )
	{
		// We try to switch pages and give it time for the main post to cut off if it's too long.
		// This is super hacky, it doesn't always work...
		// I don't really know how to make this better.
		// Maybe a scroll directive that gets loaded in once the content is loaded for main post?
		// Would sure be a lot of work just to get the scrolling hook working better.
		this.currentPage = page;
		$timeout( function()
		{
			Scroll.to( 'forum-posts-list', { animate: true } );
		}, 200 );
	};

	this.report = function()
	{
		Report_Modal.show( this.topic );
	};
} );
