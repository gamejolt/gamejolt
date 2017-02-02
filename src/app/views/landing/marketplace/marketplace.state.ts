import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'landing.marketplace', {
	url: '/marketplace',
	lazyLoad: () => $import( './marketplace.module' ),
	resolve: {
		payload: () => Api.sendRequest( '/web/marketplace' ),
	}
} );
