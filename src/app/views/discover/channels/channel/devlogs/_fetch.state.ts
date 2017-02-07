import { Transition } from 'angular-ui-router';
import { makeState } from '../../../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'discover.channels.channel.devlogs._fetch', {
	url: '/devlogs/:section?query&page',
	lazyLoad: () => $import( './devlogs.module' ),
	lazyLoadComponent: '_fetch',
	params: {
		section: {
			value: 'hot',
			squash: true,
		},
	},
	resolve: {

		/*@ngInject*/
		payload: async ( $transition$: Transition, filteringContainer: any ) =>
		{
			await filteringContainer.init( 'discover.channels.channel.devlogs._fetch', $transition$.params() );

			const query = filteringContainer.getQueryString( $transition$.params() );
			return await Api.sendRequest( '/web/discover/channels/devlogs/' + $transition$.params().channel + '?' + query );
		}
	}
} );
