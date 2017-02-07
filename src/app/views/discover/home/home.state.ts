import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

makeState( 'discover.home', {
	url: '/',
	lazyLoad: () => $import( './home.module' ),
	resolve: {
		/*@ngInject*/
		payload: ( History_Cache: any ) => History_Cache.cache( () => Api.sendRequest( '/web/discover' ) ),
	},
} );
