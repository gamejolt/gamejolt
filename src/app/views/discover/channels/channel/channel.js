angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel', {
		url: '/:channel',
		abstract: true,
		controller: 'Discover.Channels.ChannelCtrl',
		controllerAs: 'channelCtrl',
		templateUrl: '/app/views/discover/channels/channel/channel.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/channels/' + $stateParams.channel );
			},
		}
	} );
} );
