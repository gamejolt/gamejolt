import { OverviewCtrl } from './overview-controller';

const MODULE = 'App.Views.Channels.Channel.Overview';
export default MODULE;

angular.module( MODULE, [] )
.config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel.overview', {
		url: '',
		controller: OverviewCtrl,
		controllerAs: 'overviewCtrl',
		templateUrl: '/app/views/discover/channels/channel/overview/overview.html',
		resolve: {
			payload: ( Api, $stateParams ) =>
			{
				return Api.sendRequest( '/web/discover/channels/overview/' + $stateParams.channel );
			},
		}
	} );
} );
