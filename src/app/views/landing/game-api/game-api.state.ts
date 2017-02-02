import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'landing.game-api', {
	url: '/game-api',
	lazyLoad: () => $import( './game-api.module' ),
} );
