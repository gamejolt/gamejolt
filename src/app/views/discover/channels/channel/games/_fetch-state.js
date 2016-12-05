angular.module( 'App.Views' ).config( function( $stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider )
{
	$stateProvider.state( 'discover.channels.channel.games._fetch', {
		url: '/games/:section?price&sort&os&browser&maturity&status&partners&query&page',
		params: {
			section: {
				value: 'hot',
				squash: true,
			},
		},
		controller: 'Discover.Channels.Channel.Games._FetchCtrl',
		templateUrl: '/app/views/discover/channels/channel/games/_fetch.html',
		resolve: {
			payload: function( $state, $stateParams, Api, filteringContainer )
			{
				return filteringContainer.init( 'discover.channels.channel.games._fetch', $stateParams )
					.then( function()
					{
						var query = filteringContainer.getQueryString( $stateParams );
						return Api.sendRequest( '/web/discover/channels/games/' + $stateParams.channel + '?' + query );
					} );
			}
		}
	} );
} );
