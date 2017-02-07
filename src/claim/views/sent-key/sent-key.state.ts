import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'retrieve.sent-key', {
	lazyLoad: () => $import( './sent-key.module' ),
} );
