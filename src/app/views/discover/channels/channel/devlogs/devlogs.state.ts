import { makeState } from '../../../../../../lib/gj-lib-client/utils/angular-facade';

makeState( 'discover.channels.channel.devlogs', {
	abstract: true,
	lazyLoad: () => $import( './devlogs.module' ),
	resolve: {

		/*@ngInject*/
		filteringContainer: ( Game_Filtering_Container: any ) =>
		{
			const filteringContainer = new Game_Filtering_Container();

			// Devlogs don't have filters.
			filteringContainer.isPersistent = false;
			filteringContainer.shouldDetect = false;

			return filteringContainer;
		}
	}
} );
