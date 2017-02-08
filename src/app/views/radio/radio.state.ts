import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

makeState( 'radio', {
	url: '/radio',
	lazyLoad: () => $import( './radio.module' ),
	resolve: {
		/*@ngInject*/
		init: ( Translate: any ) => Translate.loadSection( 'main' ),
		payload: () => Api.sendRequest( '/site-api/discover' ),
	},
} );
