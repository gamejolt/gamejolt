import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.indieaf', {
	url: '/indieaf',
	lazyLoad: () => $import( './indieaf.module' ),
} );
