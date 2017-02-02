import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'dashboard', {
	url: '/dashboard',
	lazyLoad: () => $import( './dashboard.module' ),
	resolve: {
		init: ( Translate: any ) =>
			Promise.all( [ Translate.loadSection( 'main' ), Translate.loadSection( 'dash' ) ] ),
	}
} );
