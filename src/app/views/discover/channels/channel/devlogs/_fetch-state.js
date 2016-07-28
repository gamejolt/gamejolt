angular.module( 'App.Views' ).config( function( $stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider )
{
	$stateProvider.state( 'discover.channels.channel.devlogs._fetch', {
		url: '/devlogs/:section?query&page',
		params: {
			section: {
				value: 'hot',
				squash: true,
			},
		},
		controller: 'Discover.Channels.Channel.Devlogs._FetchCtrl',
		templateUrl: '/app/views/discover/channels/channel/devlogs/_fetch.html',
		resolve: {
			payload: function( $state, $stateParams, Api, filteringContainer )
			{
				return filteringContainer.init( 'discover.channels.channel.devlogs._fetch', $stateParams )
					.then( function()
					{
						var query = filteringContainer.getQueryString( $stateParams );
						return Api.sendRequest( '/web/discover/channels/devlogs/' + $stateParams.channel + '?' + query );
					} );
			}
		}
	} );
} );
