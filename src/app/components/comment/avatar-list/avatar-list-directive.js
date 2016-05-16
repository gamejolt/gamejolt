angular.module( 'App.Comment.AvatarList' ).component( 'gjCommentAvatarList', {
	bindings: {
		resource: '@commentResource',
		resourceId: '<commentResourceId',
	},
	templateUrl: '/app/components/comment/avatar-list/avatar-list.html',
	controller: function( Comment, Popover )
	{
		var _this = this;

		this.comments = [];

		this.refreshComments = refreshComments;
		this.showPopover = showPopover;
		this.hidePopover = hidePopover;

		this.refreshComments();

		function showPopover( $event, commentId )
		{
			console.log( $event );
			// Popover.hideAll( { skip: popoverCtrl } );
			var popover = Popover.getPopover( 'comment-avatar-list-item-' + commentId );
			popover.trigger( angular.element( $event.target ) );


						// Trigger the popover.
						// Will either hide or show depending on its status.
						// popoverCtrl.trigger( element );
		}

		function hidePopover( commentId )
		{
			var popover = Popover.getPopover( 'comment-avatar-list-item-' + commentId );
			popover.hide( angular.element( $event.target ) );
		}

		function refreshComments()
		{
			// Pull in new comments, huzzah!
			Comment.fetch( this.resource, this.resourceId, this.currentPage )
				.then( function( payload )
				{
					console.log( payload );
					// Check the hash in the URL to see if we should autoscroll to a comment.
					// checkAutoScroll();

					// _this.hasLoaded = true;
					// _this.hasError = false;
					_this.comments = Comment.populate( payload.comments );
					// _this.resourceOwner = new User( payload.resourceOwner );
					// _this.perPage = payload.perPage || 10;
					// _this.commentsCount = payload.count || 0;
					// _this.parentCount = payload.parentCount || 0;

					// Child comments.
					// _this.childComments = {};
					// if ( payload.childComments ) {
					// 	var childComments = Comment.populate( payload.childComments );
					// 	_this.childComments = _.groupBy( childComments, 'parent_id' );
					// }

					// // Votes made by the user.
					// _this.userVotes = {};
					// if ( payload.userVotes ) {
					// 	var userVotes = Comment_Vote.populate( payload.userVotes );
					// 	_this.userVotes = _.indexBy( userVotes, 'comment_id' );
					// }

					// // User subscriptions to comment threads.
					// _this.subscriptions = {};
					// if ( payload.subscriptions ) {
					// 	var subscriptions = Subscription.populate( payload.subscriptions );
					// 	_this.subscriptions = _.indexBy( subscriptions, 'resource_id' );
					// }

					// _this.translations = {};
					// _this.isTranslating = false;
					// _this.isShowingTranslations = false;
					// _this.translationsLoaded = false;
					// _this.allowTranslate = _this.gatherTranslatable().length;
				} )
				// .catch( function( payload )
				// {
				// 	_this.hasError = true;
				// } );
		};
	}
} );
