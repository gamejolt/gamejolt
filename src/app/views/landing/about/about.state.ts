import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.about', {
	url: '/about',
	lazyLoad: () => $import( './about.module' ),
} );
