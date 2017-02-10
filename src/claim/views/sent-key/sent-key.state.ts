import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'sent-key', {
	lazyLoad: () => $import( './sent-key.module' ),
} );
