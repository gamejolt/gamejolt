angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel.overview', {
		url: '',
		controller: 'Discover.Channels.Channel.OverviewCtrl',
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/channels/channel/overview/overview.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/discover/channels/overview/' + $stateParams.channel );
			},
		}
	} );
} );
