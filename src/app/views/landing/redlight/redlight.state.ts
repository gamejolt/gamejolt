import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.redlight', {
	url: '/redlight',
	lazyLoad: () => $import( './redlight.module' ),
} );
