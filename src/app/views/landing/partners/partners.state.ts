import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.partners', {
	url: '/partners',
	lazyLoad: () => $import( './partners.module' ),
} );
