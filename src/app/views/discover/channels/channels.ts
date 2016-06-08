import channelMod from './channel/channel';

angular.module( 'App.Views.Channels', [
	channelMod,
] )
.config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels', {
		url: '/channels',
		abstract: true,
		template: '<ui-view></ui-view>',
		resolve: {

			// Channel controllers are lazy loaded.
			components: ( $ocLazyLoad ) =>
			{
				return $ocLazyLoad.load( '/app/modules/channels.js' );
			},
		}
	} );
} );
