import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.learn', {
	url: '/learn',
	lazyLoad: () => $import( './learn.module' ),
} );
