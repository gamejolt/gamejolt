import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'invalid-key', {
	lazyLoad: () => $import( './invalid-key.module' ),
} );
