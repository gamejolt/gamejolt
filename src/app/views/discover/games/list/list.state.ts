import { makeState } from '../../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'discover.games.list', {
	abstract: true,
	lazyLoad: () => $import( './list.module' ),
	resolve: {

		/*@ngInject*/
		filteringContainer: ( Game_Filtering_Container: any ) => new Game_Filtering_Container(),
	}
} );
