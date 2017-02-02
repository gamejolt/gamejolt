import { makeState } from '../../../../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'dashboard.developer.games.manage.game', {
	abstract: true,
	lazyLoad: () => $import( './game.module' ),
} );
