import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewDownloadSoundtrack: VueRouter.RouteConfig = {
	name: 'discover.games.view.download.soundtrack',
	path: 'download/soundtrack',
	component: () => asyncComponentLoader( $import( './soundtrack' ) ),
	children: [
			// http://localhost:8080/games/tea-time-with-luap-sere-make-the-world-right/soundtracks/download/863
		{
			path: `/games/:slug/soundtracks/download/:id(\\d+)`,
			redirect: ( to ) =>
			{
				return {
					name: 'discover.games.view.download.soundtrack',
					params: to.params,
				};
			}
		},
	],
};
