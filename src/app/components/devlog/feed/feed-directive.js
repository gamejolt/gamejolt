angular.module( 'App.Devlog.Feed' ).component( 'gjDevlogFeed', {
	bindings: {
		posts: '<devlogPosts',
	},
	templateUrl: '/app/components/devlog/feed/feed.html'
} );
