import { makeState } from '../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'key.game', {
	lazyLoad: () => $import( './game.module' ),
} );
