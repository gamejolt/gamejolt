angular.module( 'App.Forum.ChannelList' ).directive( 'gjForumChannelList', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./channel-list.html' ),
		scope: {
			category: '=',
			channels: '=',
			_latestPosts: '=latestPosts',
			postCountPerPage: '=',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, Screen )
		{
			$scope.Screen = Screen;

			this.latestPosts = _.indexBy( this._latestPosts, function( item )
			{
				return item.topic.channel_id;
			} );

			this.getPostPage = function( post )
			{
				if ( !this.postCountPerPage ) {
					return undefined;
				}
				var page = Math.ceil( post.topic.replies_count / this.postCountPerPage );
				if ( page == 1 ) {
					return undefined;
				}
				return page;
			};
		},
	}
} );
