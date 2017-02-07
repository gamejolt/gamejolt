import { makeState } from '../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'discover', {
	abstract: true,
	lazyLoad: () => $import( './discover.module' ),
	resolve: {

		/*@ngInject*/
		init: ( Translate: any ) => Translate.loadSection( 'main' ),
	}
} );
