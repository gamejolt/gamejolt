angular.module( 'App.Forum.PostList' ).directive( 'gjForumPostListPost', function()
{
	return {
		restrict: 'E',
		templateUrl: '/app/components/forum/post-list/post.html',
		scope: {
			topic: '=',
			post: '=',
			isReply: '=?',
			onReply: '=?',
			userPostCount: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $element, $scope, $state, $q, $location, Environment, App, Api, Popover, Forum_Post, Growls, AutoScroll, Report_Modal )
		{
			var _this = this;

			$scope.Environment = Environment;
			$scope.App = App;
			$scope.listCtrl = $scope.$parent.listCtrl;

			this.id = (this.isReply ? this.post.parent_post_id + '-' : '') + this.post.id;
			this.isEditing = false;
			this.isReplying = false;
			this.isActive = false;

			this.showingParent = false;
			this.parent = null;

			checkPermalink();

			this.toggleReplies = function()
			{
				if ( $scope.listCtrl.showingReplies[ this.post.id ] ) {
					$scope.listCtrl.showingReplies[ this.post.id ] = false;
					return $q.resolve();
				}

				// If we already have replies loaded in from a previous run, let's show them while loading new ones.
				if ( $scope.listCtrl.replies[ this.post.id ] && $scope.listCtrl.replies[ this.post.id ].length ) {
					$scope.listCtrl.showingReplies[ this.post.id ] = true;
				}

				return this.loadReplies();
			};

			this.loadReplies = function()
			{
				return Api.sendRequest( '/web/forums/posts/replies/' + this.post.id ).then( function( payload )
				{
					$scope.listCtrl.replies[ _this.post.id ] = Forum_Post.populate( payload.replies );
					$scope.listCtrl.replyCounts[ _this.post.id ] = payload.repliesCount || 0;
					$scope.listCtrl.userPostCounts = payload.userPostCounts || {};

					if ( !$scope.listCtrl.showingReplies[ _this.post.id ] ) {
						$scope.listCtrl.showingReplies[ _this.post.id ] = true;
					}
				} );
			};

			this.loadParentPost = function()
			{
				if ( this.showingParent ) {
					this.showingParent = false;
					return $q.resolve();
				}

				// Don't load it in more than once.
				if ( this.parent ) {
					_this.showingParent = true;
					return $q.resolve();
				}

				return Api.sendRequest( '/web/forums/posts/parent/' + this.post.id ).then( function( payload )
				{
					_this.parent = new Forum_Post( payload.parent );
					_this.showingParent = true;
				} );
			};

			this.reply = function()
			{
				this.isReplying = true;
			};

			this.closeReply = function()
			{
				this.isReplying = false;
			};

			this.onReplied = function( formModel, response )
			{
				// If their post was marked as spam, make sure they know.
				if ( formModel.status == Forum_Post.STATUS_SPAM ) {
					Growls.info( 'Your post has been marked for review. Please allow some time for it to show on the site.', 'Post Needs Review' );
				}

				this.isReplying = false;

				// If the replies list is open, we add it at the bottom of the replies list as well.
				// Otherwise we let the caller of the post-list handle the new reply.
				if ( $scope.listCtrl.showingReplies[ this.post.id ] ) {
					this.loadReplies();
				}

				// Hand it off to whatever called the post-list directive.
				if ( this.onReply ) {
					this.onReply( { formModel: formModel, $response: response } );
				}
			};

			this.edit = function()
			{
				this.isEditing = true;
				Popover.hideAll();
			};

			this.closeEdit = function()
			{
				this.isEditing = false;
			};

			this.report = function()
			{
				Report_Modal.show( this.post );
			};

			this.inViewChange = function( isInView )
			{
				if ( isInView && this.post.notification ) {

					// Don't wait for success before updating the view.
					this.post.notification.$read();
					this.post.notification = null;
				}
			};

			this.copyPermalink = function()
			{
				// We have to add it into view, select, copy, then remove. Yeesh.
				var permalinkElem = angular.element( '<input type="text" value="' + this.post.getPermalink() + '" id="forum-post-permalink-' + this.id + '">' );
				$element.append( permalinkElem );
				permalinkElem[0].select();

				if ( document.execCommand( 'copy' ) ) {
					Growls.success( 'Copied permalink to your clipboard.', 'Copied!' );
				}
				else {
					Growls.error( 'Could not copy permalink to your clipboard. Dunno why. Sorry.', 'Copy Failed' );
				}

				permalinkElem.remove();
			};

			function checkPermalink()
			{
				var hash = $location.hash();
				if ( !hash || hash.indexOf( 'forum-post-' ) !== 0 ) {
					return;
				}

				if ( hash == 'forum-post-' + _this.id ) {
					_this.isActive = true;
				}
			}
		}
	}
} );
