import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'discover.channels.list', {
	url: '',
	lazyLoad: () => $import( './list.module' ),
	resolve: {

		/*@ngInject*/
		payload: () => Api.sendRequest( '/web/discover/channels' ),
	}
} );
