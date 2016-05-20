angular.module( 'App.Views' ).config( function( $stateProvider, $urlMatcherFactoryProvider, $urlRouterProvider )
{
	function getQueryString( $stateParams, filteringContainer )
	{
		var searchParams = [
			'section=' + $stateParams.section,
		];

		if ( $stateParams.page > 1 ) {
			searchParams.push( 'page=' + $stateParams.page );
		}

		searchParams.push( filteringContainer.getQueryString() );
		var query = searchParams.join( '&' );

		return query;
	}

	$stateProvider.state( 'discover.channels.channel.games._fetch', {
		url: '/games/:section?price&sort&os&browser&maturity&status&query&page',
		params: {
			section: {
				value: 'hot',
				squash: true,
			},
		},
		controller: 'Discover.Channels.Channel.Games._FetchCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/discover/channels/channel/games/_fetch/_fetch.html',
		resolve: {
			payload: function( $state, $stateParams, Api, filteringContainer )
			{
				return filteringContainer.init( 'discover.channels.channel.games._fetch', $stateParams )
					.then( function()
					{
						var query = getQueryString( $stateParams, filteringContainer );
						return Api.sendRequest( '/web/discover/channels/games/' + $stateParams.channel + '?' + query );
					} );
			}
		}
	} );
} );
