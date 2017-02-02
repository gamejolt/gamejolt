import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

makeState( 'radio', {
	url: '/radio',
	lazyLoad: () => $import( './radio.module' ),
	resolve: {
		payload: () => Api.sendRequest( '/site-api/discover' ),
	},
} );
