import { Transition } from 'angular-ui-router';
import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'discover.channels.channel', {
	abstract: true,
	url: '/:channel',
	lazyLoad: () => $import( './channel.module' ),
	resolve: {

		/*@ngInject*/
		payload: ( $transition$: Transition ) =>
			Api.sendRequest( '/web/discover/channels/' + $transition$.params().channel ),
	}
} );
