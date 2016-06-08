import overviewMod from './overview/overview';

import { ChannelCtrl } from './channel-controller';

const MODULE = 'App.Views.Channels.Channel';
export default MODULE;

angular.module( MODULE, [
	overviewMod,
] )
.config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel', {
		url: '/:channel',
		abstract: true,
		controller: ChannelCtrl,
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
