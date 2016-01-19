angular.module( 'App.Fireside.Post.Feed' ).directive( 'gjFiresidePostFeed', function( Environment )
{
	return {
		restrict: 'AE',
		templateUrl: '/app/components/fireside/post/feed/feed.html',
		scope: {
			posts: '=gjPosts'
		},
		link: function( scope )
		{
			scope.Environment = Environment;
		}
	};
} );
