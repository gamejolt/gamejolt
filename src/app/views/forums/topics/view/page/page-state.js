angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.view.page', {
		url: '/f/:slug/:id?page',
		controller: 'Forums.Topics.View.PageCtrl',
		resolve: {
			payload: function( Api, $stateParams, History_Cache )
			{
				return History_Cache.cache( function()
				{
					return Api.sendRequest( '/web/forums/topics/' + $stateParams.id + '?page=' + ($stateParams.page || 1) );
				} );
			},
			tick: function( HistoryTick, $stateParams )
			{
				HistoryTick.sendBeacon( 'forum-topic', $stateParams.id );
			},
		}
	} );
} );
