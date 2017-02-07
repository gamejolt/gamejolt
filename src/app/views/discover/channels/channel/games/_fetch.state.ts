import { makeState } from '../../../../../../lib/gj-lib-client/utils/angular-facade';
import { Transition } from 'angular-ui-router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'discover.channels.channel.games._fetch', {
	url: '/games/:section?price&sort&os&browser&maturity&status&partners&query&page',
	lazyLoad: () => $import( './games.module' ),
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
			await filteringContainer.init( 'discover.channels.channel.games._fetch', $transition$.params() );

			const query = filteringContainer.getQueryString( $transition$.params() );
			return await Api.sendRequest( '/web/discover/channels/games/' + $transition$.params().channel + '?' + query );
		}
	}
} );
