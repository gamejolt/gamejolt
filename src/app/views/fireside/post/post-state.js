angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'fireside.post', {
		url: '/post/:slug',
		controller: 'Fireside.PostCtrl',
		controllerAs: 'postCtrl',
		templateUrl: '/app/views/fireside/post/post.html',
		resolve: {
			payload: function( Api, Fireside_Post, $stateParams )
			{
				var postHash = Fireside_Post.pullHashFromUrl( $stateParams.slug );
				return Api.sendRequest( '/fireside/posts/' + postHash );
			},
			tick: function( HistoryTick, payload )
			{
				HistoryTick.sendBeacon( 'fireside-post', payload.post.id );
			},
		}
	} );
} );
