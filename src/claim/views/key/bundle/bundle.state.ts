import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'key.bundle', {
	lazyLoad: () => $import( './bundle.module' ),
} );
